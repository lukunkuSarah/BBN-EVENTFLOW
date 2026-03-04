import { Router } from "express";
import { pgPool } from "../db/postgres.js";
import { logActivity, getRecentLogs, getEventStats } from "../db/mariadb.js";

const router = Router();

// ── SSE clients ───────────────────────────────────────────────────────────────
const clients = new Set();

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitizeRow(r) {
  return {
    id:              r.id,
    title:           r.title,
    description:     r.description,
    date:            r.date,
    capacity:        r.capacity,
    registeredCount: Number(r.registered_count ?? 0),
  };
}

async function listEvents() {
  const { rows } = await pgPool.query(
    `SELECT e.id, e.title, e.description, e.date, e.capacity,
            COALESCE(COUNT(r.user_id), 0) AS registered_count
       FROM events e
  LEFT JOIN registrations r ON r.event_id = e.id
   GROUP BY e.id
   ORDER BY e.date ASC`
  );
  return rows.map(sanitizeRow);
}

async function getEventById(id) {
  const { rows } = await pgPool.query(
    `SELECT e.id, e.title, e.description, e.date, e.capacity,
            COALESCE(COUNT(r.user_id), 0) AS registered_count
       FROM events e
  LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.id = $1
   GROUP BY e.id`,
    [id]
  );
  return rows[0] ? sanitizeRow(rows[0]) : null;
}

async function broadcast() {
  const payload = `data: ${JSON.stringify(await listEvents())}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch {}
  }
}

function authUserId(req) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/.exec(h);
  if (!m) return null;
  const token = m[1];
  if (!token.startsWith("user:")) return null;
  const id = Number(token.slice(5));
  return Number.isFinite(id) ? id : null;
}

// ── GET /events ───────────────────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  res.json(await listEvents());
});

// ── POST /events ──────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const { title, description, date, capacity } = req.body || {};
  if (!title || !date) return res.status(400).json({ message: "title and date required" });

  const { rows } = await pgPool.query(
    `INSERT INTO events (title, description, date, capacity, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title, description || "", new Date(date).toISOString(), Number(capacity ?? 0), userId]
  );

  const ev = await getEventById(rows[0].id);

  // ── Journal MariaDB ──
  await logActivity({
    action:     "event_created",
    eventId:    ev.id,
    eventTitle: ev.title,
    userId,
    details:    { capacity: ev.capacity, date: ev.date },
  });

  await broadcast();
  res.status(201).json(ev);
});

// ── PATCH /events/:id ─────────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const id = Number(req.params.id);
  const { title, description, date, capacity } = req.body || {};

  const set = []; const vals = []; let n = 1;
  if (title       !== undefined) { set.push(`title=$${n++}`);       vals.push(title); }
  if (description !== undefined) { set.push(`description=$${n++}`); vals.push(description); }
  if (date        !== undefined) { set.push(`date=$${n++}`);        vals.push(new Date(date).toISOString()); }
  if (capacity    !== undefined) { set.push(`capacity=$${n++}`);    vals.push(Number(capacity)); }

  if (set.length === 0) return res.json(await getEventById(id));

  vals.push(id);
  await pgPool.query(`UPDATE events SET ${set.join(", ")} WHERE id=$${n}`, vals);
  const ev = await getEventById(id);

  // ── Journal MariaDB ──
  await logActivity({
    action:     "event_updated",
    eventId:    id,
    eventTitle: ev?.title,
    userId,
    details:    { updatedFields: Object.keys(req.body || {}) },
  });

  await broadcast();
  res.json(ev);
});

// ── DELETE /events/:id ────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const id = Number(req.params.id);
  const ev = await getEventById(id);

  await pgPool.query("DELETE FROM events WHERE id=$1", [id]);

  // ── Journal MariaDB ──
  await logActivity({
    action:     "event_deleted",
    eventId:    id,
    eventTitle: ev?.title,
    userId,
    details:    { capacity: ev?.capacity },
  });

  await broadcast();
  res.status(204).end();
});

// ── POST /events/:id/register ─────────────────────────────────────────────────
router.post("/:id/register", async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const id = Number(req.params.id);
  const ev = await getEventById(id);
  if (!ev) return res.status(404).json({ message: "not found" });
  if (ev.registeredCount >= ev.capacity)
    return res.status(400).json({ message: "event full" });

  await pgPool.query(
    "INSERT INTO registrations (event_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [id, userId]
  );

  const updated = await getEventById(id);

  // ── Journal MariaDB ──
  await logActivity({
    action:     "user_registered",
    eventId:    id,
    eventTitle: ev.title,
    userId,
    details:    { spots_remaining: updated.capacity - updated.registeredCount },
  });

  await broadcast();
  res.json(updated);
});

// ── POST /events/:id/cancel ───────────────────────────────────────────────────
router.post("/:id/cancel", async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const id = Number(req.params.id);
  const ev = await getEventById(id);

  await pgPool.query(
    "DELETE FROM registrations WHERE event_id=$1 AND user_id=$2",
    [id, userId]
  );

  const updated = await getEventById(id);

  // ── Journal MariaDB ──
  await logActivity({
    action:     "user_cancelled",
    eventId:    id,
    eventTitle: ev?.title,
    userId,
    details:    null,
  });

  await broadcast();
  res.json(updated);
});

// ── GET /events/logs ──────────────────────────────────────────────────────────
// Retourne les dernières entrées du journal d'activité (MariaDB)
router.get("/logs", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs  = await getRecentLogs(limit);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ message: e?.message || "failed to fetch logs" });
  }
});

// ── GET /events/stats ─────────────────────────────────────────────────────────
// Retourne les agrégats de statistiques depuis MariaDB
router.get("/stats", async (_req, res) => {
  try {
    const stats = await getEventStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ message: e?.message || "failed to fetch stats" });
  }
});

// ── GET /events/stream (SSE) ──────────────────────────────────────────────────
router.get("/stream", async (req, res) => {
  res.writeHead(200, {
    "Content-Type":  "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection":    "keep-alive",
  });
  res.write(`data: ${JSON.stringify(await listEvents())}\n\n`);
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

export default router;

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

// ── Middleware: admin only ────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  const userId = authUserId(req);
  if (!userId) return res.status(401).json({ message: "unauthorized" });
  try {
    const { rows } = await pgPool.query("SELECT is_admin FROM users WHERE id=$1", [userId]);
    if (!rows[0]?.is_admin) return res.status(403).json({ message: "forbidden — admin only" });
    req.userId = userId;
    next();
  } catch (e) {
    res.status(500).json({ message: e?.message || "auth check failed" });
  }
}

// ── GET /events ───────────────────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  res.json(await listEvents());
});

// ── GET /events/my-registrations ─────────────────────────────────────────────
router.get("/my-registrations", async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.json([]);
  const { rows } = await pgPool.query(
    "SELECT event_id FROM registrations WHERE user_id=$1",
    [userId]
  );
  res.json(rows.map((r) => r.event_id));
});

// ── GET /events/registrations/all  (admin) ───────────────────────────────────
router.get("/registrations/all", requireAdmin, async (_req, res) => {
  const { rows } = await pgPool.query(
    `SELECT e.id AS event_id, e.title AS event_title,
            u.id AS user_id, u.name, u.email,
            r.created_at AS registered_at
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       JOIN users  u ON u.id = r.user_id
      ORDER BY r.created_at DESC`
  );
  res.json(rows);
});

// ── POST /events ──────────────────────────────────────────────────────────────
router.post("/", requireAdmin, async (req, res) => {
  const { title, description, date, capacity } = req.body || {};
  if (!title || !date) return res.status(400).json({ message: "title and date required" });

  const { rows } = await pgPool.query(
    `INSERT INTO events (title, description, date, capacity, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title, description || "", new Date(date).toISOString(), Number(capacity ?? 0), req.userId]
  );

  const ev = await getEventById(rows[0].id);

  await logActivity({
    action:     "event_created",
    eventId:    ev.id,
    eventTitle: ev.title,
    userId:     req.userId,
    details:    { capacity: ev.capacity, date: ev.date },
  });

  await broadcast();
  res.status(201).json(ev);
});

// ── PATCH /events/:id ─────────────────────────────────────────────────────────
router.patch("/:id", requireAdmin, async (req, res) => {
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

  await logActivity({
    action:     "event_updated",
    eventId:    id,
    eventTitle: ev?.title,
    userId:     req.userId,
    details:    { updatedFields: Object.keys(req.body || {}) },
  });

  await broadcast();
  res.json(ev);
});

// ── DELETE /events/:id ────────────────────────────────────────────────────────
router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const ev = await getEventById(id);

  await pgPool.query("DELETE FROM events WHERE id=$1", [id]);

  await logActivity({
    action:     "event_deleted",
    eventId:    id,
    eventTitle: ev?.title,
    userId:     req.userId,
    details:    { capacity: ev?.capacity },
  });

  await broadcast();
  res.status(204).end();
});

// ── GET /events/:id/registrations  (admin) ───────────────────────────────────
router.get("/:id/registrations", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pgPool.query(
    `SELECT u.id, u.name, u.email, r.created_at AS registered_at
       FROM registrations r
       JOIN users u ON u.id = r.user_id
      WHERE r.event_id = $1
      ORDER BY r.created_at ASC`,
    [id]
  );
  res.json(rows);
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

import mysql from "mysql2/promise";

// ── Pool de connexion MariaDB ────────────────────────────────────────────────
export const mariaPool = mysql.createPool({
  host:             process.env.MARIADB_HOST     || "localhost",
  port:             Number(process.env.MARIADB_PORT || 3306),
  database:         process.env.MARIADB_DATABASE  || "eventflow_logs",
  user:             process.env.MARIADB_USER       || "eventflow_user",
  password:         process.env.MARIADB_PASSWORD   || "eventflow_secret_2024",
  waitForConnections: true,
  connectionLimit:  10,
  timezone:         "Z",          // stocker en UTC
});

// ── Ping de vérification ─────────────────────────────────────────────────────
export async function pingMariaDB() {
  const [rows] = await mariaPool.query("SELECT 1 AS ok");
  return Array.isArray(rows) && rows.length > 0;
}

// ── Log d'activité ───────────────────────────────────────────────────────────
/**
 * Insère une ligne dans event_logs et met à jour event_stats.
 * Ne bloque jamais le flux principal : les erreurs sont loggées sans throw.
 *
 * @param {Object} params
 * @param {'event_created'|'event_updated'|'event_deleted'|'user_registered'|'user_cancelled'} params.action
 * @param {number}  params.eventId
 * @param {string}  [params.eventTitle]
 * @param {number}  [params.userId]
 * @param {Object}  [params.details]
 */
export async function logActivity({ action, eventId, eventTitle, userId, details }) {
  try {
    const conn = await mariaPool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Écriture dans le journal
      await conn.query(
        `INSERT INTO event_logs (action, event_id, event_title, user_id, details)
         VALUES (?, ?, ?, ?, ?)`,
        [
          action,
          eventId,
          eventTitle || null,
          userId     || null,
          details ? JSON.stringify(details) : null,
        ]
      );

      // 2. Mise à jour des agrégats event_stats
      if (action === "event_created" || action === "event_updated") {
        await conn.query(
          `INSERT INTO event_stats (event_id, event_title)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE event_title = VALUES(event_title)`,
          [eventId, eventTitle || null]
        );
      } else if (action === "event_deleted") {
        await conn.query(
          `DELETE FROM event_stats WHERE event_id = ?`,
          [eventId]
        );
      } else if (action === "user_registered") {
        await conn.query(
          `INSERT INTO event_stats (event_id, event_title, total_registers)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE
             total_registers = total_registers + 1,
             event_title     = COALESCE(VALUES(event_title), event_title)`,
          [eventId, eventTitle || null]
        );
      } else if (action === "user_cancelled") {
        await conn.query(
          `INSERT INTO event_stats (event_id, event_title, total_cancels)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE
             total_cancels = total_cancels + 1,
             event_title   = COALESCE(VALUES(event_title), event_title)`,
          [eventId, eventTitle || null]
        );
      }

      await conn.commit();
    } catch (innerErr) {
      await conn.rollback();
      throw innerErr;
    } finally {
      conn.release();
    }
  } catch (e) {
    // On ne remonte jamais l'erreur : le log ne doit pas faire échouer l'API
    console.warn("[mariadb] logActivity failed:", e?.message);
  }
}

// ── Récupération des logs ────────────────────────────────────────────────────
export async function getRecentLogs(limit = 50) {
  const [rows] = await mariaPool.query(
    `SELECT id, action, event_id, event_title, user_id,
            details, created_at
       FROM event_logs
      ORDER BY created_at DESC
      LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function getEventStats() {
  const [rows] = await mariaPool.query(
    `SELECT event_id, event_title, total_registers,
            total_cancels, last_activity_at
       FROM event_stats
      ORDER BY last_activity_at DESC`
  );
  return rows;
}

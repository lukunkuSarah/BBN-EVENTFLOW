import { Router } from "express";
import { pgPool } from "../db/postgres.js";

const router = Router();

function makeToken(userId) {
  return `user:${userId}`;
}

function parseToken(authHeader) {
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/.exec(authHeader);
  if (!m) return null;
  const token = m[1];
  if (!token.startsWith("user:")) return null;
  const id = Number(token.slice(5));
  return Number.isFinite(id) ? id : null;
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email and password required" });
  try {
    const insert = await pgPool.query(
      "INSERT INTO users (email, name, password_hash) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING RETURNING id, email, name, is_admin",
      [email, name || email.split("@")[0], String(password)]
    );
    if (insert.rowCount === 0) return res.status(409).json({ message: "user already exists" });
    const user = insert.rows[0];
    const token = makeToken(user.id);
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ message: e?.message || "register failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const { rows } = await pgPool.query(
      "SELECT id, email, name, password_hash, is_admin FROM users WHERE email=$1",
      [email]
    );
    const user = rows?.[0];
    if (!user || user.password_hash !== String(password))
      return res.status(401).json({ message: "invalid credentials" });
    const token = makeToken(user.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin }, token });
  } catch (e) {
    res.status(500).json({ message: e?.message || "login failed" });
  }
});

router.get("/me", async (req, res) => {
  const userId = parseToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ message: "unauthorized" });
  try {
    const { rows } = await pgPool.query(
      "SELECT id, email, name, is_admin FROM users WHERE id=$1",
      [userId]
    );
    const user = rows?.[0];
    if (!user) return res.status(401).json({ message: "unauthorized" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e?.message || "failed" });
  }
});

export default router;

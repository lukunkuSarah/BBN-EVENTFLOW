import { Router } from "express";
import { pingPostgres } from "../db/postgres.js";
import { pingMariaDB } from "../db/mariadb.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/db", async (_req, res) => {
  try {
    const [pgOk, mariaOk] = await Promise.all([pingPostgres(), pingMariaDB()]);
    res.json({ status: "ok", postgres: pgOk, mariadb: mariaOk });
  } catch (e) {
    res
      .status(500)
      .json({ status: "error", message: e?.message || "db ping failed" });
  }
});

export default router;

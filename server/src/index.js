import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";

import healthRouter  from "./routes/health.js";
import authRouter    from "./routes/auth.js";
import eventsRouter  from "./routes/events.js";
import { pingPostgres } from "./db/postgres.js";
import { pingMariaDB  } from "./db/mariadb.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/health",  healthRouter);
app.use("/auth",    authRouter);
app.use("/events",  eventsRouter);

app.get("/", (_req, res) => {
  res.json({ name: "EVENTFLOW API", status: "ok" });
});

const port = Number(process.env.API_PORT || 3000);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);

  // Ping PostgreSQL
  pingPostgres()
    .then((ok) => {
      if (ok) console.log("[db] postgres  connection: ok");
      else    console.warn("[db] postgres  connection: failed (ping returned false)");
    })
    .catch((e) => console.error("[db] postgres  connection failed:", e?.message || e));

  // Ping MariaDB
  pingMariaDB()
    .then((ok) => {
      if (ok) console.log("[db] mariadb   connection: ok");
      else    console.warn("[db] mariadb   connection: failed (ping returned false)");
    })
    .catch((e) => console.warn("[db] mariadb   connection failed:", e?.message || e));
});

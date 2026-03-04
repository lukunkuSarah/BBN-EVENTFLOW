import { Pool } from "pg";

// Render fournit DATABASE_URL → priorité absolue.
// En local Docker on retombe sur les variables individuelles.
export const pgPool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host:     process.env.POSTGRES_HOST || process.env.DB_HOST     || "localhost",
      port:     Number(process.env.POSTGRES_PORT || process.env.DB_PORT || 5432),
      database: process.env.POSTGRES_DB   || process.env.DB_NOM       || "eventflow",
      user:     process.env.POSTGRES_USER || process.env.DB_UTILISATEUR || "eventflow",
      password: process.env.POSTGRES_PASSWORD || process.env.DB_MOT_DE_PASSE || "eventflow_pw",
    });

export async function pingPostgres() {
  const res = await pgPool.query("SELECT 1 AS ok;");
  return res.rows?.[0]?.ok === 1;
}

import { Pool } from "pg";

const host = process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost'
const port = Number(process.env.POSTGRES_PORT || process.env.DB_PORT || 5432)
const database = process.env.POSTGRES_DB || process.env.DB_NOM || 'eventflow'
const user = process.env.POSTGRES_USER || process.env.DB_UTILISATEUR || 'eventflow'
const password = process.env.POSTGRES_PASSWORD || process.env.DB_MOT_DE_PASSE || 'eventflow_pw'

export const pgPool = new Pool({ host, port, database, user, password })

export async function pingPostgres() {
  const res = await pgPool.query("SELECT 1 AS ok;");
  return res.rows?.[0]?.ok === 1;
}

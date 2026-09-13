-- Auteur : BB_NUMERIQUE - LUKUNKU K.SARAH
-- create_postgres.sql : prépare un PostgreSQL installé en natif (sans Docker).
-- Crée l'utilisateur et la base avec les identifiants du docker-compose.yml.
--
-- À exécuter avec psql, en superutilisateur "postgres", connecté à la base "postgres" :
--   psql -h 127.0.0.1 -U postgres -d postgres -f scripts/local-db/create_postgres.sql
--
-- Idempotent : peut être relancé sans erreur.
-- Ce fichier utilise \gexec, une commande propre à psql (ne pas le coller tel quel dans pgAdmin).

-- 1. Utilisateur applicatif
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'eventflow_user') THEN
    CREATE ROLE eventflow_user LOGIN PASSWORD 'eventflow_secret_2024';
  ELSE
    ALTER ROLE eventflow_user WITH LOGIN PASSWORD 'eventflow_secret_2024';
  END IF;
END
$$;

-- 2. Base de données, propriété de l'utilisateur applicatif.
--    CREATE DATABASE ne peut pas s'exécuter dans un bloc DO, d'où \gexec.
SELECT 'CREATE DATABASE eventflow_db OWNER eventflow_user ENCODING ''UTF8'' TEMPLATE template0'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'eventflow_db')\gexec

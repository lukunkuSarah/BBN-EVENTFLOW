-- Auteur : BB_NUMERIQUE - LUKUNKU K.SARAH
-- create_mariadb.sql : prépare un MariaDB installé en natif (sans Docker).
-- Crée la base et l'utilisateur avec les identifiants du docker-compose.yml.
--
-- À exécuter avec le client mariadb, en root :
--   mariadb -h 127.0.0.1 -u root -p -e "source scripts/local-db/create_mariadb.sql"
--
-- Idempotent : peut être relancé sans erreur.

CREATE DATABASE IF NOT EXISTS eventflow_logs
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Deux entrées : 'localhost' pour les connexions locales résolues par nom,
-- '%' pour 127.0.0.1 et ::1 (comme le fait l'image Docker officielle).
CREATE USER IF NOT EXISTS 'eventflow_user'@'localhost' IDENTIFIED BY 'eventflow_secret_2024';
CREATE USER IF NOT EXISTS 'eventflow_user'@'%'         IDENTIFIED BY 'eventflow_secret_2024';
ALTER USER 'eventflow_user'@'localhost' IDENTIFIED BY 'eventflow_secret_2024';
ALTER USER 'eventflow_user'@'%'         IDENTIFIED BY 'eventflow_secret_2024';

GRANT ALL PRIVILEGES ON eventflow_logs.* TO 'eventflow_user'@'localhost';
GRANT ALL PRIVILEGES ON eventflow_logs.* TO 'eventflow_user'@'%';
FLUSH PRIVILEGES;

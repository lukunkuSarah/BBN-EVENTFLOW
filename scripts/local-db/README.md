# Installation locale sans Docker (Windows)

Ce dossier permet de faire tourner EVENTFLOW quand Docker Desktop ne démarre pas
(par exemple « Virtualization support not detected »). PostgreSQL et MariaDB sont
installés directement sur Windows, avec les mêmes identifiants que `docker-compose.yml`.

| Service    | Base             | Utilisateur      | Mot de passe            | Port |
|------------|------------------|------------------|-------------------------|------|
| PostgreSQL | `eventflow_db`   | `eventflow_user` | `eventflow_secret_2024` | 5432 |
| MariaDB    | `eventflow_logs` | `eventflow_user` | `eventflow_secret_2024` | 3306 |

## 0. Prérequis

- **Git for Windows** : https://git-scm.com/downloads/win (ou `winget install --id Git.Git -e --source winget`).
  Nécessaire pour récupérer la branche, et pour que Claude Code puisse exécuter des commandes Bash.
- **Node.js LTS** : https://nodejs.org (ou `winget install OpenJS.NodeJS.LTS`).
  Nécessaire pour lancer l'API et le client (`npm`).

Après chaque installation, fermer puis rouvrir PowerShell pour que les nouvelles commandes soient reconnues.
Si le chemin du projet contient des espaces, l'entourer de guillemets : `cd "C:\Users\...\Mon Dossier\BBN-EVENTFLOW"`.

Sans Git, la branche peut aussi être téléchargée en ZIP :
https://github.com/lukunkuSarah/BBN-EVENTFLOW/archive/refs/heads/claude/busy-meitner-8bvqv0.zip

## 1. Installer PostgreSQL 16

1. Télécharger l'installateur Windows (EDB), version 16 : https://www.postgresql.org/download/windows/
2. Pendant l'installation : garder le port 5432, choisir un mot de passe pour le
   superutilisateur `postgres` et le noter. pgAdmin 4 est inclus, il remplace le conteneur pgadmin.
3. Le service Windows « postgresql-x64-16 » démarre automatiquement.

## 2. Installer MariaDB 11

1. Télécharger le MSI Windows, série 11.x (par exemple 11.8 LTS) : https://mariadb.org/download/
2. Pendant l'installation : définir le mot de passe root et le noter, cocher
   « Use UTF8 as default server's character set », garder le port 3306 et « Install as service ».

## 3. Créer les bases et charger les données

Dans PowerShell, depuis la racine du projet :

```powershell
powershell -ExecutionPolicy Bypass -File scripts\local-db\setup-windows.ps1
```

Le script demande les deux mots de passe administrateur, puis :

1. crée l'utilisateur et la base PostgreSQL (`create_postgres.sql`) ;
2. charge `docker/init.sql` : tables, compte de démonstration, événements ;
3. crée l'utilisateur et la base MariaDB (`create_mariadb.sql`) ;
4. charge `docker/init_mariadb.sql` : journal d'activité ;
5. crée `server/.env` à partir de `server/.env.example`.

Il peut être relancé sans risque : les étapes 2 et 4 sont ignorées si les tables existent déjà.

### À la main, sans le script

Adapter les chemins des exécutables à la version installée.

```powershell
$env:PGCLIENTENCODING = "UTF8"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -U postgres -d postgres -f scripts\local-db\create_postgres.sql
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -U eventflow_user -d eventflow_db -f docker\init.sql

& "C:\Program Files\MariaDB 11.8\bin\mariadb.exe" -h 127.0.0.1 -u root -p -e "source scripts/local-db/create_mariadb.sql"
& "C:\Program Files\MariaDB 11.8\bin\mariadb.exe" -h 127.0.0.1 -u eventflow_user -p -e "source docker/init_mariadb.sql" eventflow_logs

Copy-Item server\.env.example server\.env
```

## 4. Lancer l'application

```powershell
cd server
npm install
npm run dev        # API sur http://localhost:3000
```

Dans un second terminal :

```powershell
cd client
npm install
npm run dev        # site sur http://localhost:5173
```

Vérification : http://localhost:3000/health/db doit répondre `{"status":"ok","postgres":true,"mariadb":true}`.

Compte de démonstration : `demo@eventflow.local` / `demo1234`.

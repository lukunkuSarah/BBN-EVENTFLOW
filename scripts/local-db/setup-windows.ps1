# Auteur : BB_NUMERIQUE - LUKUNKU K.SARAH
# setup-windows.ps1 : prépare les bases EVENTFLOW sur PostgreSQL 16 et MariaDB 11
# installés en natif sur Windows (sans Docker).
#
# Prérequis : les services PostgreSQL et MariaDB sont installés et démarrés.
#
# Lancement, depuis la racine du projet :
#   powershell -ExecutionPolicy Bypass -File scripts\local-db\setup-windows.ps1
#
# Les mots de passe administrateur sont demandés à l'écran. Ils peuvent aussi être
# passés en paramètres : -PgSuperPassword ... -MdbRootPassword ...
#
# Étapes :
#   1. PostgreSQL : utilisateur + base          (scripts/local-db/create_postgres.sql)
#   2. PostgreSQL : schéma + données de démo    (docker/init.sql)
#   3. MariaDB    : utilisateur + base          (scripts/local-db/create_mariadb.sql)
#   4. MariaDB    : schéma + données de démo    (docker/init_mariadb.sql)
#   5. server/.env créé depuis server/.env.example s'il n'existe pas
#
# Le script peut être relancé : les étapes 2 et 4 sont ignorées si les tables existent déjà.

param(
  [string]$PgSuperPassword = "",
  [string]$MdbRootPassword = "",
  [string]$PgHost  = "127.0.0.1",
  [int]   $PgPort  = 5432,
  [string]$MdbHost = "127.0.0.1",
  [int]   $MdbPort = 3306
)

$ErrorActionPreference = "Stop"

# ── Chemins et identifiants (identiques au docker-compose.yml) ───────────────
$Root      = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PgCreate  = Join-Path $Root "scripts/local-db/create_postgres.sql"
$PgInit    = Join-Path $Root "docker/init.sql"
$MdbCreate = Join-Path $Root "scripts/local-db/create_mariadb.sql"
$MdbInit   = Join-Path $Root "docker/init_mariadb.sql"

$AppUser     = "eventflow_user"
$AppPassword = "eventflow_secret_2024"
$PgDb        = "eventflow_db"
$MdbDb       = "eventflow_logs"

# ── Fonctions utilitaires ────────────────────────────────────────────────────
function Find-Tool {
  param([string]$Name, [string[]]$Patterns)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($pattern in $Patterns) {
    $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue |
             Sort-Object FullName -Descending | Select-Object -First 1
    if ($found) { return $found.FullName }
  }
  return $null
}

function Read-Secret([string]$Prompt) {
  $secure = Read-Host -Prompt $Prompt -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try     { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Invoke-Tool([string]$Exe, [string[]]$Arguments) {
  & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Échec de la commande : $Exe $($Arguments -join ' ')" }
}

# ── Outils ───────────────────────────────────────────────────────────────────
$Psql = Find-Tool "psql" @("C:\Program Files\PostgreSQL\*\bin\psql.exe")
if (-not $Psql) {
  throw "psql.exe introuvable. Installez PostgreSQL 16 : https://www.postgresql.org/download/windows/"
}
$Mariadb = Find-Tool "mariadb" @("C:\Program Files\MariaDB*\bin\mariadb.exe", "C:\Program Files\MariaDB*\bin\mysql.exe")
if (-not $Mariadb) { $Mariadb = Find-Tool "mysql" @() }
if (-not $Mariadb) {
  throw "mariadb.exe introuvable. Installez MariaDB 11 : https://mariadb.org/download/"
}
Write-Host "psql    : $Psql"
Write-Host "mariadb : $Mariadb"
Write-Host ""

if (-not $PgSuperPassword) { $PgSuperPassword = Read-Secret "Mot de passe du superutilisateur PostgreSQL 'postgres'" }
if (-not $MdbRootPassword) { $MdbRootPassword = Read-Secret "Mot de passe root de MariaDB" }
Write-Host ""

# Arguments de connexion communs
$PgConn  = @("-h", $PgHost, "-p", "$PgPort")
$MdbConn = @("-h", $MdbHost, "-P", "$MdbPort", "--default-character-set=utf8mb4")

# ── 1. PostgreSQL : utilisateur + base ───────────────────────────────────────
$env:PGCLIENTENCODING = "UTF8"        # les fichiers SQL sont en UTF-8 (accents)
Write-Host "[1/4] PostgreSQL : utilisateur $AppUser et base $PgDb"
$env:PGPASSWORD = $PgSuperPassword
Invoke-Tool $Psql ($PgConn + @("-v", "ON_ERROR_STOP=1", "-q", "-U", "postgres", "-d", "postgres", "-f", $PgCreate))

# ── 2. PostgreSQL : schéma + données de démo ─────────────────────────────────
Write-Host "[2/4] PostgreSQL : chargement de docker/init.sql"
$env:PGPASSWORD = $AppPassword
$pgHasTables = & $Psql @PgConn -U $AppUser -d $PgDb -At -c "SELECT to_regclass('public.events') IS NOT NULL;"
if ($LASTEXITCODE -ne 0) { throw "Connexion à $PgDb impossible avec l'utilisateur $AppUser" }
if ("$pgHasTables".Trim() -eq "t") {
  Write-Host "      tables déjà présentes, étape ignorée"
} else {
  Invoke-Tool $Psql ($PgConn + @("-v", "ON_ERROR_STOP=1", "-q", "-U", $AppUser, "-d", $PgDb, "-f", $PgInit))
}

# ── 3. MariaDB : utilisateur + base ──────────────────────────────────────────
# Le client lit le mot de passe dans MYSQL_PWD (évite de le passer en argument).
Write-Host "[3/4] MariaDB : utilisateur $AppUser et base $MdbDb"
$env:MYSQL_PWD = $MdbRootPassword
Invoke-Tool $Mariadb ($MdbConn + @("-u", "root", "-e", "source $($MdbCreate.Replace('\', '/'))"))

# ── 4. MariaDB : schéma + données de démo ────────────────────────────────────
Write-Host "[4/4] MariaDB : chargement de docker/init_mariadb.sql"
$env:MYSQL_PWD = $AppPassword
$mdbHasTables = & $Mariadb @MdbConn -u $AppUser -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$MdbDb' AND table_name = 'event_logs';"
if ($LASTEXITCODE -ne 0) { throw "Connexion à $MdbDb impossible avec l'utilisateur $AppUser" }
if ("$mdbHasTables".Trim() -eq "1") {
  Write-Host "      tables déjà présentes, étape ignorée"
} else {
  Invoke-Tool $Mariadb ($MdbConn + @("-u", $AppUser, "-e", "source $($MdbInit.Replace('\', '/'))", $MdbDb))
}

# ── Vérification ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Vérification :"
$env:PGPASSWORD = $AppPassword
& $Psql @PgConn -U $AppUser -d $PgDb -At -c "SELECT '  PostgreSQL : ' || (SELECT count(*) FROM users) || ' utilisateur(s), ' || count(*) || ' événement(s)' FROM events;"
$env:MYSQL_PWD = $AppPassword
& $Mariadb @MdbConn -u $AppUser -N -B -e "SELECT CONCAT('  MariaDB    : ', COUNT(*), ' ligne(s) dans event_logs') FROM event_logs;" $MdbDb

# ── 5. server/.env ───────────────────────────────────────────────────────────
$EnvFile    = Join-Path $Root "server/.env"
$EnvExample = Join-Path $Root "server/.env.example"
if (Test-Path $EnvFile) {
  Write-Host "  server/.env existe déjà, non modifié (vérifiez qu'il pointe vers $PgHost et $MdbHost)"
} else {
  Copy-Item $EnvExample $EnvFile
  Write-Host "  server/.env créé à partir de server/.env.example"
}

# Les mots de passe ne restent pas dans l'environnement du processus
Remove-Item Env:PGPASSWORD, Env:MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Terminé. Pour lancer l'application :"
Write-Host "  cd server ; npm install ; npm run dev     (API sur http://localhost:3000)"
Write-Host "  cd client ; npm install ; npm run dev     (site sur http://localhost:5173)"

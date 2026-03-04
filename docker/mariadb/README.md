This directory is reserved for MariaDB customizations.

Current stack uses Postgres for the demo API. If you want MariaDB:
- Add a `mariadb` service in `docker-compose.yml` (image `mariadb:11`)
- Mount an init script from this folder, e.g. `./docker/mariadb/init.sql:/docker-entrypoint-initdb.d/init.sql`

See `init.sql.example` in this folder.


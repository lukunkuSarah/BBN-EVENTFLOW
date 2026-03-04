This directory is reserved for Postgres customizations (config, additional init scripts).

By default, docker-compose mounts `../init.sql` into the container at `/docker-entrypoint-initdb.d/init.sql`.
Add more `.sql` or `.sh` files here if you need extra setup.


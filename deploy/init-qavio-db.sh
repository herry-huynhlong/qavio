#!/bin/sh
set -eu
# Bootstrap only a new, independent production volume.
[ "$POSTGRES_DB" = 'qavio_prod' ] && [ "$POSTGRES_USER" = 'qavio_owner' ] || exit 1
[ "${#QAVIO_APP_DB_PASSWORD}" -ge 32 ] || exit 1
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=app_password="$QAVIO_APP_DB_PASSWORD" <<'SQL'
CREATE ROLE qavio_app LOGIN PASSWORD :'app_password';
GRANT CONNECT ON DATABASE qavio_prod TO qavio_app;
GRANT USAGE ON SCHEMA public TO qavio_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qavio_owner IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO qavio_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qavio_owner IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO qavio_app;
SQL

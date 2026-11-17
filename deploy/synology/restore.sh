#!/bin/sh
# Restore a backup produced by backup.sh. DESTRUCTIVE: replaces the current database.
#   sudo ./restore.sh backups/yasun_studio-20261118-020000.dump
set -eu
cd "$(dirname "$0")"
# Container Manager ships either the compose plugin or the standalone binary.
if docker compose version >/dev/null 2>&1; then dc() { docker compose "$@"; }; else dc() { docker-compose "$@"; }; fi
file=${1:?usage: ./restore.sh backups/<file>.dump}
[ -s "$file" ] || { echo "✗ File not found or empty: $file"; exit 1; }

# Read only what we need (never `source` .env: passwords may contain $, spaces, …).
env_get() { grep -E "^$1=" .env | tail -n1 | cut -d= -f2-; }
POSTGRES_USER=$(env_get POSTGRES_USER)
POSTGRES_DB=$(env_get POSTGRES_DB)
printf "This will REPLACE database '%s' with %s. Type the database name to continue: " "$POSTGRES_DB" "$file"
read -r answer
[ "$answer" = "$POSTGRES_DB" ] || { echo "Aborted."; exit 1; }

dc stop backend frontend
dc exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < "$file"
dc start backend frontend
echo "✓ Restored $file"

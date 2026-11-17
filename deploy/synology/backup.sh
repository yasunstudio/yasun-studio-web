#!/bin/sh
# Consistent PostgreSQL backup (pg_dump, custom format) with retention.
# Schedule in DSM: Control Panel → Task Scheduler → Create → Scheduled Task → User-defined script
#   User: root · Daily 02:00 · Command: /volume1/docker/yasun-studio/backup.sh
set -eu
cd "$(dirname "$0")"
# Container Manager ships either the compose plugin or the standalone binary.
if docker compose version >/dev/null 2>&1; then dc() { docker compose "$@"; }; else dc() { docker-compose "$@"; }; fi
KEEP_DAYS=${KEEP_DAYS:-14}
mkdir -p backups

# Read only what we need (never `source` .env: passwords may contain $, spaces, …).
env_get() { grep -E "^$1=" .env | tail -n1 | cut -d= -f2-; }
POSTGRES_USER=$(env_get POSTGRES_USER)
POSTGRES_DB=$(env_get POSTGRES_DB)
stamp=$(date +%Y%m%d-%H%M%S)
file="backups/yasun_studio-${stamp}.dump"

dc exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$file"
[ -s "$file" ] || { echo "✗ Backup is empty: $file"; rm -f "$file"; exit 1; }
echo "✓ Backup written: $file ($(du -h "$file" | cut -f1))"

find backups -name 'yasun_studio-*.dump' -mtime +"$KEEP_DAYS" -delete

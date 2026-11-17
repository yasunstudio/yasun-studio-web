#!/bin/sh
# Pull the latest images and (re)start the stack, then verify health.
# Run on the NAS:  sudo ./deploy.sh            (or IMAGE_TAG=sha-abc1234 sudo ./deploy.sh)
set -eu
cd "$(dirname "$0")"
# Container Manager ships either the compose plugin or the standalone binary.
if docker compose version >/dev/null 2>&1; then dc() { docker compose "$@"; }; else dc() { docker-compose "$@"; }; fi

[ -f .env ] || { echo "✗ .env not found in $(pwd) — copy .env.example first."; exit 1; }
mkdir -p data/postgres data/redis backups

echo "→ Backing up the database before deploying…"
[ -n "$(dc ps -q db 2>/dev/null)" ] && ./backup.sh || echo "  (database not running yet — skipped)"

if [ "${SKIP_PULL:-0}" = "1" ]; then
  echo "→ SKIP_PULL=1: using local images"
else
  echo "→ Pulling images…"
  dc pull
fi

echo "→ Starting stack (migrations run automatically in the backend)…"
dc up -d --remove-orphans

http_ok() { if command -v wget >/dev/null 2>&1; then wget -qO /dev/null "$1"; else curl -fsS -o /dev/null "$1"; fi; }
port=$(grep -E '^LAN_PORT=' .env | cut -d= -f2); port=${port:-8088}
echo "→ Waiting until the site answers on http://127.0.0.1:${port} (max 5 min)…"
# Poll the real endpoints (container health columns are blank for a moment after start).
ok=0
for i in $(seq 1 60); do
  if http_ok "http://127.0.0.1:${port}/health" && http_ok "http://127.0.0.1:${port}/"; then
    ok=1; break
  fi
  sleep 5
done
dc ps
if [ "$ok" = 1 ]; then
  echo "✓ Deploy OK — API and site respond at http://127.0.0.1:${port}"
else
  echo "✗ Site did not become healthy. Inspect with: docker compose logs --tail=100 backend frontend gateway"
  exit 1
fi

echo "→ Removing unused images…"
docker image prune -f >/dev/null

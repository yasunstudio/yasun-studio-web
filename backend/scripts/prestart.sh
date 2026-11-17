#!/usr/bin/env sh
# Runs once before the API starts: wait for deps → migrate → seed.
set -e

echo "⏳ Waiting for PostgreSQL & Redis..."
python - <<'PY'
import asyncio, sys
from sqlalchemy import text
from app.core.database import engine
from app.core.redis import redis_client

async def wait():
    for attempt in range(30):
        try:
            async with engine.connect() as c:
                await c.execute(text("SELECT 1"))
            await redis_client.ping()
            return
        except Exception as e:
            print(f"  attempt {attempt + 1}/30: {type(e).__name__}")
            await asyncio.sleep(2)
    sys.exit("Dependencies not reachable")

asyncio.run(wait())
PY

echo "📦 Running migrations..."
alembic upgrade head

echo "🌱 Seeding..."
python -m scripts.seed

echo "✅ Prestart complete"

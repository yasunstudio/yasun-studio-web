from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.core.redis import redis_client

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def liveness() -> dict[str, str]:
    """Process is up (used by Docker healthcheck)."""
    return {"status": "ok", "service": settings.PROJECT_NAME}


@router.get("/ready")
async def readiness() -> JSONResponse:
    """Dependencies reachable (used by orchestrators / load balancers)."""
    checks: dict[str, str] = {}
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {type(exc).__name__}"
    try:
        await redis_client.ping()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = f"error: {type(exc).__name__}"

    healthy = all(v == "ok" for v in checks.values())
    return JSONResponse(
        {"status": "ok" if healthy else "degraded", "checks": checks},
        status_code=200 if healthy else 503,
    )

"""Redis fixed-window rate limiter, usable as a FastAPI dependency.

@router.post("/login", dependencies=[Depends(RateLimiter("login", times=5, seconds=60))])
"""

import structlog
from fastapi import Request

from app.core.exceptions import RateLimitedError
from app.core.redis import redis_client

log = structlog.get_logger(__name__)


class RateLimiter:
    def __init__(self, scope: str, *, times: int, seconds: int) -> None:
        self.scope = scope
        self.times = times
        self.seconds = seconds

    async def __call__(self, request: Request) -> None:
        # X-Real-IP is overwritten by nginx with the TCP peer address, so it can't be
        # spoofed by clients (unlike the first X-Forwarded-For entry). Next.js server
        # actions forward it unchanged. The backend port is never public in production.
        client_ip = request.headers.get("x-real-ip") or (
            request.client.host if request.client else "unknown"
        )
        key = f"ratelimit:{self.scope}:{client_ip}"
        try:
            async with redis_client.pipeline(transaction=True) as pipe:
                pipe.incr(key)
                pipe.expire(key, self.seconds, nx=True)
                count, _ = await pipe.execute()
        except Exception:  # fail open if Redis is unavailable
            log.warning("ratelimit.redis_unavailable", scope=self.scope)
            return
        if int(count) > self.times:
            raise RateLimitedError(
                f"Terlalu banyak permintaan. Coba lagi dalam {self.seconds} detik."
            )

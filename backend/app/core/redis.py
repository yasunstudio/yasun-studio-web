"""Shared async Redis client."""

from redis.asyncio import Redis, from_url

from app.core.config import settings

redis_client: Redis = from_url(
    str(settings.REDIS_URL),
    encoding="utf-8",
    decode_responses=True,
    health_check_interval=30,
)


def get_redis() -> Redis:
    return redis_client

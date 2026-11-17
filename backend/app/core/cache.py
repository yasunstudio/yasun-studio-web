"""Namespaced JSON cache on Redis with O(1) invalidation.

Each namespace has a version counter. Keys embed the current version, so
`invalidate(ns)` simply bumps the counter and old keys expire naturally.
"""

from collections.abc import Awaitable, Callable
from typing import Any

import orjson
import structlog

from app.core.config import settings
from app.core.redis import redis_client

log = structlog.get_logger(__name__)


async def _version(namespace: str) -> str:
    return await redis_client.get(f"cache:ver:{namespace}") or "0"


async def cached[T](
    namespace: str,
    key: str,
    loader: Callable[[], Awaitable[T]],
    ttl: int | None = None,
) -> Any:
    """Return cached JSON for (namespace, key) or compute it with `loader`."""
    try:
        full_key = f"cache:{namespace}:v{await _version(namespace)}:{key}"
        hit = await redis_client.get(full_key)
        if hit is not None:
            return orjson.loads(hit)
    except Exception:  # cache must never take the API down
        log.warning("cache.read_failed", namespace=namespace, key=key)
        return _to_jsonable(await loader())

    value = _to_jsonable(await loader())
    try:
        await redis_client.set(full_key, orjson.dumps(value), ex=ttl or settings.CACHE_TTL_SECONDS)
    except Exception:
        log.warning("cache.write_failed", namespace=namespace, key=key)
    return value


async def invalidate(*namespaces: str) -> None:
    for ns in namespaces:
        try:
            await redis_client.incr(f"cache:ver:{ns}")
        except Exception:
            log.warning("cache.invalidate_failed", namespace=ns)


def _to_jsonable(value: Any) -> Any:
    if hasattr(value, "model_dump"):
        return value.model_dump(mode="json")
    return value

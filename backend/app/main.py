"""Yasun Studio API — application factory."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app import models  # noqa: F401  (register all models)
from app.api.health import router as health_router
from app.api.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware
from app.core.redis import redis_client

configure_logging()
log = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    log.info("startup", environment=settings.ENVIRONMENT)
    yield
    await redis_client.aclose()
    await engine.dispose()
    log.info("shutdown")


def create_app() -> FastAPI:
    docs_enabled = not settings.is_production
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        description="Backend API website & admin dashboard Yasun Studio — Belajar Coding & AI.",
        lifespan=lifespan,
        docs_url=f"{settings.API_V1_PREFIX}/docs" if docs_enabled else None,
        redoc_url=None,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json" if docs_enabled else None,
    )

    app.add_middleware(GZipMiddleware, minimum_size=1024)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALL_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)
    app.include_router(health_router)
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    return app


app = create_app()

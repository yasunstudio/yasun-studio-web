"""Structured logging: pretty console locally, JSON in staging/production."""

import logging
import sys

import structlog

from app.core.config import settings


def configure_logging() -> None:
    shared = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
    ]
    renderer = (
        structlog.dev.ConsoleRenderer()
        if settings.ENVIRONMENT == "local"
        else structlog.processors.JSONRenderer()
    )
    structlog.configure(
        processors=[*shared, structlog.processors.format_exc_info, renderer],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.getLevelNamesMapping().get(settings.LOG_LEVEL.upper(), logging.INFO)
        ),
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        cache_logger_on_first_use=True,
    )
    # Quiet noisy default loggers; our middleware emits access logs.
    logging.getLogger("uvicorn.access").disabled = True

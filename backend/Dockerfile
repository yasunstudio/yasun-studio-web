# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Yasun Studio API — multi-stage image (uv + Python 3.14)
#   target "dev"  → hot reload, dev deps, source mounted by compose
#   target "prod" → slim, non-root, multi-worker
# ---------------------------------------------------------------------------
ARG PYTHON_VERSION=3.14

FROM python:${PYTHON_VERSION}-slim AS base
COPY --from=ghcr.io/astral-sh/uv:0.13.9 /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"
WORKDIR /app

# ---- dependencies (cached layer) ------------------------------------------
FROM base AS deps
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-dev --no-install-project

# ---- development -----------------------------------------------------------
FROM deps AS dev
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "./scripts/prestart.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]

# ---- production ------------------------------------------------------------
FROM base AS prod
RUN groupadd --system app && useradd --system --gid app --home /app app
COPY --from=deps --chown=app:app /app/.venv /app/.venv
COPY --chown=app:app . .
USER app
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health').status==200 else 1)"
CMD ["sh", "-c", "./scripts/prestart.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${WEB_CONCURRENCY:-4} --proxy-headers --forwarded-allow-ips='*'"]

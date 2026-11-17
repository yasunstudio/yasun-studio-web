# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Yasun Studio Web — Next.js 16 multi-stage image (Node 26 LTS + pnpm)
#   target "dev"  → next dev with hot reload (source mounted by compose)
#   target "prod" → standalone output, non-root, ~150MB
# ---------------------------------------------------------------------------
ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat && npm install -g pnpm@10.20.0
WORKDIR /app

# ---- dependencies ----------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- development -----------------------------------------------------------
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---- build -----------------------------------------------------------------
FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- production ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS prod
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server.js"]

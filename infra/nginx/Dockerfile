# Production gateway image: nginx + Yasun Studio config baked in, so servers (e.g. the
# Synology NAS) only need docker-compose.yml + .env — no config files to copy around.
FROM nginx:1.31-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY proxy_headers.conf /etc/nginx/proxy_headers.conf
COPY real-ip-cloudflare.conf /etc/nginx/conf.d/real-ip/cloudflare.conf
RUN rm -f /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/nginx-health || exit 1

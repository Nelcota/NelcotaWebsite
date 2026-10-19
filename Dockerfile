# Static build with Node, served by Caddy. Versions are pinned for reproducible
# builds: update them on purpose, not by accident.

FROM node:26.11.1-bookworm-slim AS build
WORKDIR /app
# pnpm comes from the "packageManager" field in package.json.
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Canonical, hreflang, sitemap and Open Graph URLs are built from SITE_URL.
ARG SITE_URL=https://nelcota.com
ENV SITE_URL=${SITE_URL}
RUN pnpm docs:check && pnpm build

FROM caddy:2.11.7-alpine AS runtime
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv/nelcota-site
# Plain HTTP inside the container: the platform's proxy terminates TLS.
ENV SITE_ADDRESS=:80
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
RUN npm install --global pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
ARG SITE_URL=https://qavio.longh.org
ENV SITE_URL=$SITE_URL SITE_INDEXING_ENABLED=false
COPY . .
RUN pnpm lint && pnpm build

FROM postgres:16-bookworm AS operations
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates libatomic1 libstdc++6 && rm -rf /var/lib/apt/lists/* \
    && useradd --uid 1000 --create-home node
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/lib/node_modules/pnpm /usr/local/lib/node_modules/pnpm
RUN ln -s /usr/local/lib/node_modules/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm
COPY --from=builder --chown=node:node /app /app
RUN mkdir -p /var/lib/qavio/media /var/lib/qavio/ops && chown -R node:node /var/lib/qavio
USER node
ENTRYPOINT []
CMD ["node", "--import", "tsx", "scripts/outbox.ts", "--loop"]

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/deploy/runtime-environment.mjs /app/deploy/start-production.mjs ./deploy/
RUN mkdir -p /var/lib/qavio/media /var/lib/qavio/ops && chown -R node:node /var/lib/qavio
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "deploy/start-production.mjs"]

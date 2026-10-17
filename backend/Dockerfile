# ── Stage 1: Builder ──
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code and configs
COPY tsconfig*.json ./
COPY src ./src
COPY shared ./shared
COPY services ./services
COPY start_microservices.ts ./

# Compile TypeScript
RUN npx tsc -b tsconfig.json

# ── Stage 2: Production Runner ──
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install curl for container health checks and dumb-init for proper signal handling
RUN apk add --no-cache curl dumb-init

ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled files and required runtime assets from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/database/migrations ./dist/src/database/migrations
COPY --from=builder /usr/src/app/src/database/seeders ./dist/src/database/seeders
COPY start_microservices.ts ./
COPY src ./src
COPY shared ./shared
COPY services ./services

# Security: Run as unprivileged non-root node user
USER node

EXPOSE 5000

# Container Healthcheck targeting live health API endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npx", "tsx", "start_microservices.ts"]

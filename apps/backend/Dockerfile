# Build context = repo root (Railway: RAILWAY_DOCKERFILE_PATH=apps/backend/Dockerfile).
# Start runs the committed migrations and the idempotent seed, then the API.
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages ./packages
COPY apps/backend ./apps/backend
RUN pnpm install --frozen-lockfile --filter @safechilds/backend... --filter @safechilds/db...
ENV NODE_ENV=production
EXPOSE 4100
CMD ["sh", "-c", "pnpm --filter @safechilds/db migrate && pnpm --filter @safechilds/db seed && pnpm --filter @safechilds/backend start"]

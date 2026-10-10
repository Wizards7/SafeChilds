# Build context = repo root (Railway: RAILWAY_DOCKERFILE_PATH=apps/bot/Dockerfile). Long-polling, one instance.
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages ./packages
COPY apps/backend ./apps/backend
COPY apps/bot ./apps/bot
RUN pnpm install --frozen-lockfile --filter @safechilds/bot...
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@safechilds/bot", "start"]

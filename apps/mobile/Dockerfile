# Build context = repo root (Railway: RAILWAY_DOCKERFILE_PATH=apps/mobile/Dockerfile).
# NEXT_PUBLIC_* are baked in at build time: Railway passes service variables as build args when they are declared here.
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages ./packages
COPY apps/backend ./apps/backend
COPY apps/mobile ./apps/mobile
RUN pnpm install --frozen-lockfile --filter @safechilds/mobile...
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @safechilds/mobile build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@safechilds/mobile", "start"]

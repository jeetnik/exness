FROM oven/bun:1.3.3

WORKDIR /app

COPY package.json bun.lock ./

COPY apps/poller/package.json ./apps/poller/
COPY apps/server/package.json ./apps/server/
COPY apps/ws/package.json ./apps/ws/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/

COPY packages ./packages

RUN bun install --frozen-lockfile

COPY apps/ws ./apps/ws

WORKDIR /app/apps/ws

EXPOSE 8080

CMD ["bun", "index.ts"]

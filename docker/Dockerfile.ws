FROM oven/bun:1.3.3-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/ws/package.json ./apps/ws/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

COPY packages ./packages

RUN bun install --production

FROM oven/bun:1.3.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

COPY apps/ws ./apps/ws

WORKDIR /app/apps/ws

EXPOSE 8080

CMD ["bun", "index.ts"]

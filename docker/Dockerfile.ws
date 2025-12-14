FROM oven/bun:1.3.3

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/ws/package.json ./apps/ws/package.json
COPY packages ./packages

RUN bun install --frozen-lockfile

COPY apps/ws ./apps/ws

WORKDIR /app/apps/ws

EXPOSE 8080

CMD ["bun", "index.ts"]

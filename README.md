# Paper X Trading Platform

A real-time paper trading platform for cryptocurrency with live market data from Binance.

## Screenshots

### Landing Page
![Landing Page](docs/images/landing-page.png)

### Trade Page
![Trade Page](docs/images/trade-page.png)

## Project Structure

```
exeness/
├── apps/
│   ├── frontend/          # Next.js frontend (deployed to Vercel)
│   ├── server/            # Express.js REST API server
│   ├── ws/                # WebSocket server for real-time data
│   └── poller/            # Binance data poller service
├── packages/
│   ├── db/                # Prisma database schema & client
│   ├── types/             # Shared TypeScript types
│   └── typescript-config/ # Shared TypeScript configs
├── docker/
│   ├── Dockerfile.server  # Server Docker image
│   ├── Dockerfile.ws      # WebSocket Docker image
│   ├── Dockerfile.poller  # Poller Docker image
│   └── Dockerfile.web     # Frontend Docker image
├── docker-compose.yml     # Local development compose
└── docker-compose.prod.yml # Production compose
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Express.js, Bun runtime
- **Database**: PostgreSQL (users/trades), TimescaleDB (market data)
- **Cache**: Redis
- **Real-time**: WebSocket
- **Data Source**: Binance WebSocket API

---

## Local Development

### Prerequisites
- [Bun](https://bun.sh/) installed
- Docker & Docker Compose installed

### Step 1: Install Dependencies
```bash
bun install
```

### Step 2: Start Databases (Docker)
```bash
docker compose up timescaledb postgres redis -d
```

### Step 3: Setup Database
```bash
cd packages/db
bunx prisma migrate dev
bunx prisma generate
cd ../..
```

### Step 4: Start All Services
```bash
# Terminal 1 - Poller (fetches Binance data)
cd apps/poller && bun run dev

# Terminal 2 - Server (API)
cd apps/server && bun run dev

# Terminal 3 - WebSocket
cd apps/ws && bun run dev

# Terminal 4 - Frontend
cd apps/frontend && bun run dev
```

Or use Turbo to start all at once:
```bash
bun run dev
```

### Access
- Frontend: http://localhost:3000
- API: http://localhost:4000
- WebSocket: ws://localhost:8080

---

## Docker Development

### Start All Services
```bash
docker compose up -d
```

### Stop All Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f
docker logs exeness-server
docker logs exeness-poller
docker logs exeness-ws
```

### Rebuild After Code Changes
```bash
docker compose build
docker compose up -d
```

---

##  Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### Server
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/exeness
PORT=4000
JWT_SECRET=your-secret-key
```

### Poller
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/exeness
REDIS_URL=redis://localhost:6379
```

### WebSocket
```env
REDIS_URL=redis://localhost:6379
PORT=8080
```

---

## License

MIT

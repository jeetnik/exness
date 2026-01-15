# Paper X Trading Platform

A real-time paper trading platform for cryptocurrency with live market data from Binance.



---
## Architecture
<img width="1277" height="639" alt="Screenshot 2026-01-15 at 23 57 42" src="https://github.com/user-attachments/assets/232cbc71-4925-4b4c-a220-636428746c8f" />


### Landing Page

<img width="1436" height="812" alt="Screenshot 2026-01-15 at 23 58 05" src="https://github.com/user-attachments/assets/1ec94e33-ec91-468c-a170-b371a81b17a5" />

<img width="1436" height="817" alt="Screenshot 2026-01-15 at 23 58 25" src="https://github.com/user-attachments/assets/911f6e5a-abcb-488d-b833-462b148b08f6" />


### Trade Page
<img width="1440" height="810" alt="Screenshot 2026-01-15 at 23 59 55" src="https://github.com/user-attachments/assets/bcba2bbb-50c2-4526-9d2b-727d6fe957cf" />



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

## License

MIT

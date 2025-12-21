# FutureX Trading Platform - Startup Guide

## Prerequisites
- Bun runtime installed
- PostgreSQL database (for user data)
- TimescaleDB (for candle/price data)
- Redis server running

## Starting the Application

### 1. Start Redis Server
```bash
# Make sure Redis is running
redis-server
```

### 2. Start the REST API Server (Port 4000)
```bash
cd apps/server
bun install
bun run dev
```

### 3. Start the WebSocket Server (Port 8080)
```bash
cd apps/ws
bun install
bun run dev
```

### 4. Start the Poller Service
```bash
cd apps/poller
bun install
bun run dev
```

### 5. Start the Frontend (Port 3000)
```bash
cd apps/frontend
npm install
npm run dev
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
PORT=3000
```

### Server
```env
PORT=4000
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://...
TIMESCALE_URL=postgresql://...
FRONTEND_URL=http://localhost:3000
```

### WebSocket Server
```env
REDIS_URL=redis://localhost:6379
```

### Poller
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
```

## Accessing the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Features

### Public Access (No Login Required)
- ✅ View live trading charts
- ✅ See real-time market data
- ✅ Browse all trading pairs
- ✅ View price movements

### Authenticated Features (Login Required)
- ✅ Execute Buy/Sell trades
- ✅ View portfolio and balance
- ✅ Track open positions
- ✅ View trade history

## Troubleshooting

### WebSocket Connection Issues
1. Check if the WebSocket server is running on port 8080
2. Check if Redis is running
3. Check browser console for connection errors
4. Verify `NEXT_PUBLIC_WS_URL` in .env.local

### API Connection Issues
1. Check if the REST API server is running on port 4000
2. Verify `NEXT_PUBLIC_API_URL` in .env.local
3. Check CORS settings in server/index.ts

### No Market Data
1. Make sure the Poller service is running
2. Check if Binance WebSocket connection is active
3. Verify TimescaleDB is running and accessible
4. Check Redis for published messages

## Architecture

```
┌─────────────┐
│  Frontend   │ (Next.js - Port 3000)
│ (React/UI)  │
└─────┬───────┘
      │
      ├──────────────┐
      │              │
┌─────▼──────┐  ┌───▼──────────┐
│ REST API   │  │  WebSocket   │
│  Server    │  │    Server    │
│ (Port 4000)│  │  (Port 8080) │
└─────┬──────┘  └───┬──────────┘
      │             │
      │      ┌──────▼──────┐
      │      │    Redis    │
      │      │  (Pub/Sub)  │
      │      └──────▲──────┘
      │             │
┌─────▼─────────────┴───┐
│      Poller Service   │
│  (Binance WebSocket)  │
└───────────────────────┘
      │
┌─────▼──────────┐
│   TimescaleDB  │
│ (Price Data)   │
└────────────────┘
```

## Key Improvements Made

1. **Professional Trading Interface**
   - Clean, minimal design matching real exchanges
   - Professional candlestick chart with smooth interactions
   - Refined color scheme with better contrast
   - Optimized spacing and typography

2. **Enhanced Chart Features**
   - Symbol selector dropdown with popular pairs
   - Timeframe buttons (1m, 5m, 15m, 30m, 1h, 1d, 1w)
   - Full mouse/touch interactivity (zoom, pan, scroll)
   - Professional green/red candles (#16a34a/#dc2626)
   - Clean grid lines and subtle borders
   - Responsive design with proper scaling

3. **Public Trading View**
   - No login required to view charts
   - Auth modal appears only when trading
   - Seamless authentication flow

4. **Click-to-Switch Symbols**
   - Click any symbol in Live Markets to switch chart
   - Visual highlight for selected symbol

5. **Better Error Handling**
   - Graceful WebSocket reconnection
   - Visual connection status
   - User-friendly error messages
   - Clean loading states

6. **Enhanced Header**
   - Clean navigation
   - User profile dropdown
   - Sign In/Sign Up buttons

Enjoy trading on FutureX! 🚀

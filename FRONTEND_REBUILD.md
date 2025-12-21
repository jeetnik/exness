# FutureX Trading Platform - Frontend Rebuild

## Overview
Complete professional rebuild of the trading platform frontend from scratch.

## Architecture

### Core Services
- **API Client** (`lib/api-client.ts`): Centralized REST API communication with automatic auth token handling
- **WebSocket Client** (`lib/websocket-client.ts`): Real-time market data streaming with auto-reconnection

### Hooks
- **useAuth** (`hooks/useAuth.tsx`): Authentication state management, signin/signup/logout
- **useMarketData** (`hooks/useMarketData.tsx`): Live market data subscription via WebSocket
- **useChartData** (`hooks/useChartData.tsx`): Historical candles + real-time updates

### Components (`components/trading/`)

1. **Header.tsx**: Navigation bar with logo, auth buttons, user dropdown
2. **ChartPanel.tsx**: Chart container with symbol selector and timeframe buttons
3. **TradingChart.tsx**: Professional candlestick chart using lightweight-charts
4. **TradePanel.tsx**: Buy/Sell panel with margin and leverage inputs
5. **LiveMarkets.tsx**: Real-time price ticker for all trading pairs
6. **WalletPanel.tsx**: Balance display with sign-in prompt for guests
7. **OrdersPanel.tsx**: Open positions and trade history tabs
8. **AuthModal.tsx**: Sign in/Sign up modal dialog

## Features

### Public Access (No Login Required)
✅ View live trading charts
✅ See real-time market data
✅ Browse all trading pairs
✅ Switch between timeframes (1m, 5m, 15m, 30m, 1h, 1d, 1w)

### Authenticated Features (Login Required)
✅ Execute Buy/Sell trades
✅ View wallet balance
✅ Track open positions
✅ View trade history
✅ Manage leverage and margin

## Layout

```
┌─────────────────────────────────────────────────────────┐
│                       HEADER                             │
├──────────────┬────────────────────────┬─────────────────┤
│              │                        │                 │
│  LIVE        │     CHART              │   WALLET        │
│  MARKETS     │     PANEL              │   PANEL         │
│              │                        │                 │
│  - BTCUSDT   │  ┌─────────────────┐   │   TRADE         │
│  - ETHUSDT   │  │  Symbol │ TF    │   │   PANEL         │
│  - SOLUSDT   │  ├─────────────────┤   │                 │
│  - ...       │  │                 │   │   - Margin      │
│              │  │   CANDLESTICK   │   │   - Leverage    │
│              │  │     CHART       │   │   - Buy/Sell    │
│              │  │                 │   │                 │
│              │  └─────────────────┘   │                 │
│              │                        │                 │
│              │     ORDERS PANEL       │                 │
│              │  ┌─────────────────┐   │                 │
│              │  │ Open │ History  │   │                 │
│              │  └─────────────────┘   │                 │
└──────────────┴────────────────────────┴─────────────────┘
```

## Design Principles

1. **Professional Dark Theme**: Zinc color palette (#09090b, #18181b, #27272a)
2. **Brand Gradient**: Orange to Pink (#f97316 → #ec4899)
3. **Clean Typography**: Geist Sans & Geist Mono fonts
4. **Real-time Updates**: WebSocket for live prices and candle updates
5. **Responsive Grid**: 12-column layout (3-6-3 distribution)
6. **Minimal UI**: No clutter, focus on data

## Color Scheme

```css
Background:    #000000 (black)
Surface:       #09090b (zinc-950)
Card:          #18181b (zinc-900)
Border:        #27272a (zinc-800)
Text Primary:  #ffffff (white)
Text Secondary: #a1a1aa (zinc-400)
Success:       #22c55e (green-500)
Danger:        #ef4444 (red-500)
Accent:        #f97316 (orange-500)
```

## API Endpoints Used

### Authentication
- `POST /api/v1/user/signup` - Create account
- `POST /api/v1/user/signin` - Login (returns JWT token)
- `GET /api/v1/user/balance` - Get user balance

### Trading
- `POST /api/v1/trade` - Create new trade
- `GET /api/v1/trade/open` - Get open positions
- `GET /api/v1/trade` - Get closed trades history

### Market Data
- `GET /api/v1/candles` - Get historical candles
- `GET /api/v1/candles/channels` - Get available trading pairs
- `GET /api/v1/candles/latest` - Get latest candle for symbol

### WebSocket
- `ws://localhost:8080` - Real-time market data stream
  - `subscribe` - Subscribe to symbol channels
  - `unsubscribe` - Unsubscribe from channels

## Data Flow

```
1. INITIAL LOAD:
   User → Frontend → REST API → TimescaleDB
   ↓
   Historical Candles Displayed

2. REAL-TIME UPDATES:
   Binance → Poller → Redis → WebSocket Server → Frontend
   ↓
   Live Price Updates on Chart

3. TRADING:
   User → Frontend → REST API (with JWT) → PostgreSQL
   ↓
   Trade Created + Balance Updated
```

## Key Improvements from Old Frontend

1. **Cleaner Code**: Separated concerns, reusable components
2. **Better State Management**: Centralized auth and market data
3. **Professional UI**: Matches real trading platforms
4. **Proper Error Handling**: User-friendly error messages
5. **Type Safety**: Full TypeScript with proper types
6. **Performance**: Optimized WebSocket subscriptions
7. **UX**: Public viewing, auth only for trading

## File Structure

```
apps/frontend/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Main trading page
├── components/
│   ├── trading/
│   │   ├── AuthModal.tsx
│   │   ├── ChartPanel.tsx
│   │   ├── Header.tsx
│   │   ├── LiveMarkets.tsx
│   │   ├── OrdersPanel.tsx
│   │   ├── TradePanel.tsx
│   │   ├── TradingChart.tsx
│   │   └── WalletPanel.tsx
│   └── ui/                  # shadcn/ui components
├── hooks/
│   ├── useAuth.tsx
│   ├── useChartData.tsx
│   └── useMarketData.tsx
└── lib/
    ├── api-client.ts
    └── websocket-client.ts
```

## Running the Application

1. Start backend services (see STARTUP_GUIDE.md)
2. Start frontend:
   ```bash
   cd apps/frontend
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

Built with ❤️ using Next.js 15, TypeScript, Tailwind CSS, and lightweight-charts

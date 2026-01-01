import { Router, type Request, type Response } from "express";
import axios from "axios";

const router = Router();
const BINANCE_API_BASE = "https://api.binance.com/api/v3";

interface OrderBookEntry {
    price: string;
    quantity: string;
}

interface BinanceOrderBook {
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
}

interface BinanceTrade {
    id: number;
    price: string;
    qty: string;
    quoteQty: string;
    time: number;
    isBuyerMaker: boolean;
}

router.get("/orderbook", async (req: Request, res: Response) => {
    try {
        const { symbol, limit = "20" } = req.query;

        if (!symbol || typeof symbol !== 'string') {
            return res.status(400).json({
                message: "Symbol parameter is required"
            });
        }

        const binanceSymbol = symbol.toUpperCase().replace('_', '');

        const response = await axios.get<BinanceOrderBook>(
            `${BINANCE_API_BASE}/depth`,
            {
                params: {
                    symbol: binanceSymbol,
                    limit: parseInt(limit as string)
                }
            }
        );

        const formatOrderBookSide = (orders: [string, string][]) => {
            return orders.map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity),
                total: parseFloat(price) * parseFloat(quantity)
            }));
        };

        res.status(200).json({
            symbol: symbol.toUpperCase(),
            bids: formatOrderBookSide(response.data.bids),
            asks: formatOrderBookSide(response.data.asks),
            lastUpdateId: response.data.lastUpdateId
        });

    } catch (error: any) {
        console.error("Error fetching order book:", error.message);
        res.status(500).json({
            message: "Failed to fetch order book data"
        });
    }
});

router.get("/trades", async (req: Request, res: Response) => {
    try {
        const { symbol, limit = "50" } = req.query;

        if (!symbol || typeof symbol !== 'string') {
            return res.status(400).json({
                message: "Symbol parameter is required"
            });
        }

        const binanceSymbol = symbol.toUpperCase().replace('_', '');

        const response = await axios.get<BinanceTrade[]>(
            `${BINANCE_API_BASE}/trades`,
            {
                params: {
                    symbol: binanceSymbol,
                    limit: parseInt(limit as string)
                }
            }
        );

        const trades = response.data.map(trade => ({
            id: trade.id,
            price: parseFloat(trade.price),
            quantity: parseFloat(trade.qty),
            time: trade.time,
            isBuyerMaker: trade.isBuyerMaker
        }));

        res.status(200).json({
            symbol: symbol.toUpperCase(),
            trades
        });

    } catch (error: any) {
        console.error("Error fetching recent trades:", error.message);
        res.status(500).json({
            message: "Failed to fetch recent trades data"
        });
    }
});

export default router;

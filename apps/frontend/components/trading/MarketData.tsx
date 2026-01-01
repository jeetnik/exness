"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OrderBookEntry {
    price: number;
    quantity: number;
    total: number;
}

interface OrderBookData {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}

interface Trade {
    id: number;
    price: number;
    quantity: number;
    time: number;
    isBuyerMaker: boolean;
}

interface MarketDataProps {
    symbol: string;
}

export function MarketData({ symbol }: MarketDataProps) {
    const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
    const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] });
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderBook = async () => {
            try {
                const data = await apiClient.getOrderBook(symbol);
                setOrderBook(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch order book:', error);
                setLoading(false);
            }
        };

        const fetchTrades = async () => {
            try {
                const data = await apiClient.getRecentTrades(symbol);
                setTrades(data.trades);
            } catch (error) {
                console.error('Failed to fetch recent trades:', error);
            }
        };

        fetchOrderBook();
        fetchTrades();

        const orderBookInterval = setInterval(fetchOrderBook, 1000);
        const tradesInterval = setInterval(fetchTrades, 2000);

        return () => {
            clearInterval(orderBookInterval);
            clearInterval(tradesInterval);
        };
    }, [symbol]);

    const maxTotal = Math.max(
        ...orderBook.bids.map(b => b.total),
        ...orderBook.asks.map(a => a.total)
    );

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="text-zinc-400">Loading market data...</div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden h-full flex flex-col">
            <div className="flex border-b border-zinc-800 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('orderbook')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'orderbook'
                            ? 'bg-zinc-900 text-white border-b-2 border-blue-500'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    Order Book
                </button>
                <button
                    onClick={() => setActiveTab('trades')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'trades'
                            ? 'bg-zinc-900 text-white border-b-2 border-blue-500'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    Trades
                </button>
            </div>

            {activeTab === 'orderbook' ? (
                <>
                    <div className="flex text-xs text-zinc-400 px-4 py-2 bg-zinc-900/30 flex-shrink-0">
                        <div className="flex-1 text-left">Price (USD)</div>
                        <div className="flex-1 text-right">Amount</div>
                        <div className="flex-1 text-right">Total</div>
                    </div>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {orderBook.asks.slice().reverse().slice(0, 10).map((ask, idx) => (
                            <div
                                key={`ask-${idx}`}
                                className="relative flex text-xs px-4 py-1.5 hover:bg-zinc-900/50"
                            >
                                <div
                                    className="absolute inset-0 bg-red-500/10"
                                    style={{ width: `${(ask.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
                                />
                                <div className="flex-1 text-left text-red-500 relative z-10">
                                    {ask.price.toFixed(2)}
                                </div>
                                <div className="flex-1 text-right text-white relative z-10">
                                    {ask.quantity.toFixed(6)}
                                </div>
                                <div className="flex-1 text-right text-zinc-400 relative z-10">
                                    {ask.total.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-4 py-3 bg-zinc-900/50 border-y border-zinc-800 flex-shrink-0">
                        <div className="text-center">
                            {orderBook.asks.length > 0 && orderBook.bids.length > 0 && (
                                <div className="text-lg font-semibold text-white">
                                    {((orderBook.asks[orderBook.asks.length - 1].price + orderBook.bids[0].price) / 2).toFixed(2)}
                                </div>
                            )}
                            <div className="text-xs text-zinc-400 mt-0.5">Spread</div>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {orderBook.bids.slice(0, 10).map((bid, idx) => (
                            <div
                                key={`bid-${idx}`}
                                className="relative flex text-xs px-4 py-1.5 hover:bg-zinc-900/50"
                            >
                                <div
                                    className="absolute inset-0 bg-green-500/10"
                                    style={{ width: `${(bid.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
                                />
                                <div className="flex-1 text-left text-green-500 relative z-10">
                                    {bid.price.toFixed(2)}
                                </div>
                                <div className="flex-1 text-right text-white relative z-10">
                                    {bid.quantity.toFixed(6)}
                                </div>
                                <div className="flex-1 text-right text-zinc-400 relative z-10">
                                    {bid.total.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex text-xs text-zinc-400 px-4 py-2 bg-zinc-900/30 flex-shrink-0">
                        <div className="flex-1 text-left">Price (USD)</div>
                        <div className="flex-1 text-right">Amount</div>
                        <div className="flex-1 text-right">Time</div>
                    </div>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {trades.map((trade) => (
                            <div
                                key={trade.id}
                                className="flex text-xs px-4 py-1.5 hover:bg-zinc-900/50 items-center"
                            >
                                <div className={`flex-1 text-left font-medium ${
                                    trade.isBuyerMaker ? 'text-red-500' : 'text-green-500'
                                }`}>
                                    <span className="inline-flex items-center gap-1">
                                        {trade.isBuyerMaker ? (
                                            <TrendingDown className="w-3 h-3" />
                                        ) : (
                                            <TrendingUp className="w-3 h-3" />
                                        )}
                                        {trade.price.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex-1 text-right text-white">
                                    {trade.quantity.toFixed(6)}
                                </div>
                                <div className="flex-1 text-right text-zinc-400">
                                    {formatTime(trade.time)}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

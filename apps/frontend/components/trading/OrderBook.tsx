"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface OrderBookEntry {
    price: number;
    quantity: number;
    total: number;
}

interface OrderBookData {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}

interface OrderBookProps {
    symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
    const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] });
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

        fetchOrderBook();
        const interval = setInterval(fetchOrderBook, 1000);

        return () => clearInterval(interval);
    }, [symbol]);

    const maxTotal = Math.max(
        ...orderBook.bids.map(b => b.total),
        ...orderBook.asks.map(a => a.total)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="text-zinc-400">Loading order book...</div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white">Order Book</h3>
            </div>

            <div className="flex text-xs text-zinc-400 px-4 py-2 border-b border-zinc-800">
                <div className="flex-1 text-left">Price (USD)</div>
                <div className="flex-1 text-right">Amount</div>
                <div className="flex-1 text-right">Total</div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
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

            <div className="px-4 py-3 bg-zinc-900/50 border-y border-zinc-800">
                <div className="text-center">
                    {orderBook.asks.length > 0 && orderBook.bids.length > 0 && (
                        <div className="text-lg font-semibold text-white">
                            {((orderBook.asks[orderBook.asks.length - 1].price + orderBook.bids[0].price) / 2).toFixed(2)}
                        </div>
                    )}
                    <div className="text-xs text-zinc-400 mt-0.5">Mid Price</div>
                </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
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
        </div>
    );
}

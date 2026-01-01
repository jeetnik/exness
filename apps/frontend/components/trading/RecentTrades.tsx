"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
    id: number;
    price: number;
    quantity: number;
    time: number;
    isBuyerMaker: boolean;
}

interface RecentTradesProps {
    symbol: string;
}

export function RecentTrades({ symbol }: RecentTradesProps) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const data = await apiClient.getRecentTrades(symbol);
                setTrades(data.trades);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch recent trades:', error);
                setLoading(false);
            }
        };

        fetchTrades();
        const interval = setInterval(fetchTrades, 2000);

        return () => clearInterval(interval);
    }, [symbol]);

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
                <div className="text-zinc-400">Loading trades...</div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
            </div>

            <div className="flex text-xs text-zinc-400 px-4 py-2 border-b border-zinc-800">
                <div className="flex-1 text-left">Price (USD)</div>
                <div className="flex-1 text-right">Amount</div>
                <div className="flex-1 text-right">Time</div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
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
        </div>
    );
}

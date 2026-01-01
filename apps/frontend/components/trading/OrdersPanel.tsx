"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

interface Trade {
    orderId: string;
    asset?: string;
    type: string;
    margin: number;
    leverage: number;
    openPrice: number;
    currentPrice?: number;
    unrealizedPnl?: number;
    closePrice?: number;
    pnl?: number;
}

export function OrdersPanel() {
    const { isAuthenticated, refreshBalance } = useAuth();
    const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
    const [openTrades, setOpenTrades] = useState<Trade[]>([]);
    const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(false);
    const [closingOrder, setClosingOrder] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchTrades = async () => {
            try {
                setLoading(true);
                if (activeTab === 'open') {
                    const data = await apiClient.getOpenTrades();
                    setOpenTrades(data.trades || []);
                } else {
                    const data = await apiClient.getClosedTrades();
                    setClosedTrades(data.trades || []);
                }
            } catch (error) {
                console.error('Failed to fetch trades:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
        const interval = setInterval(fetchTrades, 5000);

        return () => clearInterval(interval);
    }, [isAuthenticated, activeTab]);

    const handleClosePosition = async (orderId: string) => {
        try {
            setClosingOrder(orderId);
            await apiClient.closeTrade(orderId);
            await refreshBalance();

            const data = await apiClient.getOpenTrades();
            setOpenTrades(data.trades || []);
        } catch (error) {
            console.error('Failed to close position:', error);
        } finally {
            setClosingOrder(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                <p className="text-sm text-zinc-400">Sign in to view your orders</p>
            </div>
        );
    }

    const trades = activeTab === 'open' ? openTrades : closedTrades;

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden h-full flex flex-col">
            <div className="flex border-b border-zinc-800 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('open')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                        activeTab === 'open'
                            ? 'text-white bg-zinc-900/50 border-b-2 border-white'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    Open Positions ({openTrades.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                        activeTab === 'history'
                            ? 'text-white bg-zinc-900/50 border-b-2 border-white'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    History
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-700 border-t-white mx-auto"></div>
                    </div>
                ) : trades.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-sm text-zinc-400">
                            {activeTab === 'open' ? 'No open positions' : 'No trade history'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {trades.map((trade) => (
                            <div key={trade.orderId} className="p-4 hover:bg-zinc-900/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {trade.asset && (
                                            <span className="text-xs font-semibold text-white">
                                                {trade.asset}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                            trade.type === 'buy'
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-red-500/20 text-red-500'
                                        }`}>
                                            {trade.type.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            {trade.leverage}x
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-zinc-500">
                                        #{trade.orderId.slice(0, 8)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex gap-4 text-xs flex-1">
                                        <div>
                                            <div className="text-zinc-400">Margin</div>
                                            <div className="text-white font-semibold">
                                                ${(trade.margin / 100).toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-zinc-400">Entry</div>
                                            <div className="text-white font-semibold">
                                                ${(trade.openPrice / 100).toFixed(2)}
                                            </div>
                                        </div>
                                        {trade.currentPrice && (
                                            <div>
                                                <div className="text-zinc-400">Current</div>
                                                <div className="text-white font-semibold">
                                                    ${(trade.currentPrice / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                        {trade.closePrice && (
                                            <div>
                                                <div className="text-zinc-400">Exit</div>
                                                <div className="text-white font-semibold">
                                                    ${(trade.closePrice / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                        {trade.unrealizedPnl !== undefined && (
                                            <div>
                                                <div className="text-zinc-400">Unrealized P&L</div>
                                                <div className={`font-semibold ${
                                                    trade.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                    {trade.unrealizedPnl >= 0 ? '+' : ''}${(trade.unrealizedPnl / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                        {trade.pnl !== undefined && (
                                            <div>
                                                <div className="text-zinc-400">P&L</div>
                                                <div className={`font-semibold ${
                                                    trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                    {trade.pnl >= 0 ? '+' : ''}${(trade.pnl / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {activeTab === 'open' && (
                                        <button
                                            onClick={() => handleClosePosition(trade.orderId)}
                                            disabled={closingOrder === trade.orderId}
                                            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded transition-colors whitespace-nowrap"
                                        >
                                            {closingOrder === trade.orderId ? 'Closing...' : 'Close Position'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

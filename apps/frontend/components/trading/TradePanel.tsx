"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TradePanelProps {
    symbol: string;
    currentPrice: number | null;
    onAuthRequired: () => void;
}

export function TradePanel({ symbol, currentPrice, onAuthRequired }: TradePanelProps) {
    const { isAuthenticated, refreshBalance } = useAuth();
    const [margin, setMargin] = useState('100');
    const [leverage, setLeverage] = useState('10');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrade = async (type: 'buy' | 'sell') => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }

        try {
            setLoading(true);
            setError('');

            const marginNum = parseFloat(margin);
            const leverageNum = parseInt(leverage);

            if (isNaN(marginNum) || marginNum <= 0) {
                setError('Invalid margin amount');
                return;
            }

            if (isNaN(leverageNum) || leverageNum <= 0) {
                setError('Invalid leverage');
                return;
            }

            await apiClient.createTrade(symbol, type, marginNum * 100, leverageNum);
            await refreshBalance();

            setMargin('100');
            setLeverage('10');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to execute trade');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = (parseFloat(margin) || 0) * (parseInt(leverage) || 1);

    return (
        <div className="p-4 space-y-4 bg-zinc-950 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Trade</h3>
                {currentPrice && (
                    <div className="text-right">
                        <div className="text-xs text-zinc-400">Current Price</div>
                        <div className="text-sm font-mono font-semibold text-white">
                            ${currentPrice.toFixed(2)}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div>
                    <Label className="text-xs text-zinc-400">Margin (USD)</Label>
                    <Input
                        type="number"
                        value={margin}
                        onChange={(e) => setMargin(e.target.value)}
                        className="mt-1 bg-zinc-900 border-zinc-800 text-white"
                        placeholder="100"
                    />
                </div>

                <div>
                    <Label className="text-xs text-zinc-400">Leverage</Label>
                    <Input
                        type="number"
                        value={leverage}
                        onChange={(e) => setLeverage(e.target.value)}
                        className="mt-1 bg-zinc-900 border-zinc-800 text-white"
                        placeholder="10"
                    />
                </div>

                <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-400">Total Position</span>
                        <span className="text-sm font-semibold text-white">
                            ${totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={() => handleTrade('buy')}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Buy
                    </Button>
                    <Button
                        onClick={() => handleTrade('sell')}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Sell
                    </Button>
                </div>
            </div>
        </div>
    );
}

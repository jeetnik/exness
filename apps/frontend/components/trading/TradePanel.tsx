"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

interface TradePanelProps {
    symbol: string;
    currentPrice: number | null;
    onAuthRequired: () => void;
}

interface OrderSuccess {
    type: 'buy' | 'sell';
    orderId: string;
    margin: number;
    leverage: number;
    totalPosition: number;
}

export function TradePanel({ symbol, currentPrice, onAuthRequired }: TradePanelProps) {
    const { isAuthenticated, refreshBalance } = useAuth();
    const [margin, setMargin] = useState('100');
    const [leverage, setLeverage] = useState('10');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null);

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

            const response = await apiClient.createTrade(symbol, type, marginNum * 100, leverageNum);
            await refreshBalance();

            setOrderSuccess({
                type,
                orderId: response.orderId,
                margin: marginNum,
                leverage: leverageNum,
                totalPosition: marginNum * leverageNum
            });

            setTimeout(() => {
                setOrderSuccess(null);
                setMargin('100');
                setLeverage('10');
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to execute trade');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = (parseFloat(margin) || 0) * (parseInt(leverage) || 1);

    if (orderSuccess) {
        return (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg h-full overflow-auto flex flex-col items-center justify-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${orderSuccess.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                    <CheckCircle className={`w-10 h-10 ${orderSuccess.type === 'buy' ? 'text-green-500' : 'text-red-500'
                        }`} />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">
                        Order {orderSuccess.type === 'buy' ? 'Long' : 'Short'} Placed
                    </h3>
                    <p className="text-sm text-zinc-400">
                        Order ID: {orderSuccess.orderId.slice(0, 8)}...
                    </p>
                </div>

                <div className="w-full space-y-2 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Margin</span>
                        <span className="text-white font-medium">${orderSuccess.margin}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Leverage</span>
                        <span className="text-white font-medium">{orderSuccess.leverage}x</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                        <span className="text-zinc-400">Total Position</span>
                        <span className="text-white font-semibold">${orderSuccess.totalPosition.toFixed(2)}</span>
                    </div>
                </div>

                <p className="text-xs text-zinc-500">Returning to trade form...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 bg-zinc-950 border border-zinc-800 rounded-lg h-full overflow-auto">
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
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-zinc-400">Leverage</Label>
                        <span className="text-lg font-bold text-white">{leverage}x</span>
                    </div>

                    {/* Leverage Slider */}
                    <div className="relative mb-3">
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={leverage}
                            onChange={(e) => setLeverage(e.target.value)}
                            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                                       [&::-webkit-slider-thumb]:appearance-none
                                       [&::-webkit-slider-thumb]:w-5
                                       [&::-webkit-slider-thumb]:h-5
                                       [&::-webkit-slider-thumb]:rounded-full
                                       [&::-webkit-slider-thumb]:bg-white
                                       [&::-webkit-slider-thumb]:shadow-lg
                                       [&::-webkit-slider-thumb]:shadow-white/30
                                       [&::-webkit-slider-thumb]:cursor-pointer
                                       [&::-webkit-slider-thumb]:transition-transform
                                       [&::-webkit-slider-thumb]:hover:scale-110
                                       [&::-moz-range-thumb]:w-5
                                       [&::-moz-range-thumb]:h-5
                                       [&::-moz-range-thumb]:rounded-full
                                       [&::-moz-range-thumb]:bg-white
                                       [&::-moz-range-thumb]:border-0
                                       [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${parseInt(leverage)}%, #27272a ${parseInt(leverage)}%, #27272a 100%)`
                            }}
                        />
                    </div>

                    {/* Preset Buttons */}
                    <div className="grid grid-cols-6 gap-1">
                        {[2, 5, 10, 25, 50, 100].map((val) => (
                            <button
                                key={val}
                                onClick={() => setLeverage(val.toString())}
                                className={`py-1.5 text-xs font-medium rounded transition-all ${parseInt(leverage) === val
                                    ? 'bg-white text-black shadow-lg shadow-white/20'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                {val}x
                            </button>
                        ))}
                    </div>
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

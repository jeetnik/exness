"use client";

import { useEffect, useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';

interface LiveMarketsProps {
    symbols: string[];
    selectedSymbol: string;
    onSymbolClick: (symbol: string) => void;
}

export function LiveMarkets({ symbols, selectedSymbol, onSymbolClick }: LiveMarketsProps) {
    const { marketData, isConnected } = useMarketData(symbols);
    const [prices, setPrices] = useState<Map<string, { price: number; change: number }>>(new Map());

    useEffect(() => {
        marketData.forEach((data, symbol) => {
            setPrices(prev => {
                const current = prev.get(symbol);
                const change = current ? ((data.price - current.price) / current.price) * 100 : 0;
                const newPrices = new Map(prev);
                newPrices.set(symbol, { price: data.price, change });
                return newPrices;
            });
        });
    }, [marketData]);

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Live Markets</h3>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-zinc-400">
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
                {symbols.map(symbol => {
                    const data = prices.get(symbol);
                    const isSelected = symbol === selectedSymbol;

                    return (
                        <div
                            key={symbol}
                            onClick={() => onSymbolClick(symbol)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                                isSelected
                                    ? 'bg-zinc-800/50'
                                    : 'hover:bg-zinc-900/50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
                                        {symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{symbol}</div>
                                        <div className="text-xs text-zinc-400">
                                            {symbol.replace('USDT', '/USDT')}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {data ? (
                                        <>
                                            <div className="text-sm font-mono font-semibold text-white">
                                                ${data.price.toFixed(2)}
                                            </div>
                                            <div className={`text-xs font-medium ${
                                                data.change >= 0 ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                                {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xs text-zinc-500">Loading...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

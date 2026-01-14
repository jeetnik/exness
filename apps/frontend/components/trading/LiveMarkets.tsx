"use client";

import { useEffect, useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';

// Helper function to get crypto logo
const getCryptoLogo = (symbol: string): string => {
    // Extract base crypto symbol (e.g., BTC from BTCUSDT)
    const baseSymbol = symbol.replace(/(USDT|USDC|FDUSD|BUSD)$/, '');

    // Map to the files in public folder
    const logoMap: { [key: string]: string } = {
        'BTC': '/XTVCBTC--big.svg',
        'ETH': '/XTVCETH--big.svg',
        'SOL': '/XTVCSOL--big.svg',
        'XRP': '/XTVCXRP--big.svg',
        'BNB': '/XTVCBNB--big.svg', // Assuming this might exist or fallback
        'ADA': '/XTVCADA--big.svg',
        'MATIC': '/XTVCMATIC--big.svg',
        'AVAX': '/XTVCAVAX--big.svg',
        'DOT': '/XTVCDOT--big.svg',
        'OINK': '/XTVCLINK--big.svg',
        'UNI': '/XTVCUNI--big.svg',
        'ATOM': '/XTVCATOM--big.svg',
        'DOGE': '/XTVCDOGE--big.svg',
    };

    return logoMap[baseSymbol] || `https://via.placeholder.com/32x32.png?text=${baseSymbol}`;
};

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

            <div className="divide-y divide-zinc-800 max-h-[800px] overflow-y-auto">
                {symbols.map(symbol => {
                    const data = prices.get(symbol);
                    const isSelected = symbol === selectedSymbol;
                    const logoSrc = getCryptoLogo(symbol);

                    return (
                        <div
                            key={symbol}
                            onClick={() => onSymbolClick(symbol)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${isSelected
                                ? 'bg-zinc-800/50'
                                : 'hover:bg-zinc-900/50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={logoSrc}
                                            alt={symbol}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerText = symbol.slice(0, 2);
                                            }}
                                        />
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
                                            <div className={`text-xs font-medium ${data.change >= 0 ? 'text-green-500' : 'text-red-500'
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

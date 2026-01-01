"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const cryptoLogos: { [key: string]: string } = {
    'BTC': '/XTVCBTC--big.svg',
    'ETH': '/XTVCETH--big.svg',
    'SOL': '/XTVCSOL--big.svg',
    'XRP': '/XTVCXRP--big.svg',
    'MATIC': '/XTVCMATIC--big.svg',
    'AVAX': '/XTVCAVAX--big.svg',
    'DOT': '/XTVCDOT--big.svg',
    'LINK': '/XTVCLINK--big.svg',
    'UNI': '/XTVCUNI--big.svg',
    'ATOM': '/XTVCATOM--big.svg',
    'ADA': '/XTVCADA--big.svg',
    'DOGE': '/XTVCDOGE--big.svg',
};

interface Asset {
    name: string;
    symbol: string;
    buyPrice: number;
    sellPrice: number;
    imageUrl: string;
}

interface MarketStats {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: string;
    high24h: number;
    low24h: number;
}

export function LiveMarketsTable() {
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [stats, setStats] = useState<Map<string, MarketStats>>(new Map());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'spot' | 'futures' | 'lend'>('spot');

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/v1/assets');
                const data = await response.json();
                setAssets(data.assets || []);

                const mockStats = new Map<string, MarketStats>();
                data.assets?.forEach((asset: Asset) => {
                    const change = (Math.random() - 0.5) * 10;
                    mockStats.set(asset.symbol, {
                        symbol: asset.symbol,
                        price: asset.buyPrice / 10000,
                        change24h: change,
                        volume24h: `$${(Math.random() * 500 + 50).toFixed(1)}M`,
                        high24h: asset.buyPrice / 10000 * 1.02,
                        low24h: asset.buyPrice / 10000 * 0.98
                    });
                });
                setStats(mockStats);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch assets:', error);
                setLoading(false);
            }
        };

        fetchAssets();
        const interval = setInterval(fetchAssets, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRowClick = (symbol: string) => {
        router.push(`/trade?symbol=${symbol}`);
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-zinc-400">Loading markets...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-8 justify-items-center ">
                <h2 className="text-3xl font-bold text-white">Live Markets</h2>
                <p className="text-zinc-400 mt-2">Real-time cryptocurrency prices and market data</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                            <th className="text-left py-4 px-6 font-medium">Name</th>
                            <th className="text-right py-4 px-6 font-medium">Price</th>
                            <th className="text-right py-4 px-6 font-medium">24h Volume</th>
                            <th className="text-right py-4 px-6 font-medium">24h Change</th>
                            <th className="text-right py-4 px-6 font-medium">Last 7 Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => {
                            const stat = stats.get(asset.symbol);
                            const isPositive = (stat?.change24h || 0) >= 0;

                            return (
                                <tr
                                    key={asset.symbol}
                                    onClick={() => handleRowClick(asset.symbol)}
                                    className="border-b border-zinc-800 hover:bg-zinc-900 cursor-pointer transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={cryptoLogos[asset.symbol] || asset.imageUrl}
                                                alt={asset.name}
                                                className="w-8 h-8 rounded-full"
                                                // onError={(e) => {
                                                //     e.currentTarget.src = `https://via.placeholder.com/32x32.png?text=${asset.symbol.charAt(0)}`;
                                                // }}
                                            />
                                            <div>
                                                {/* <div className="text-white font-medium">{asset.symbol}</div> */}
                                                <div className="text-zinc-500 text-sm">{asset.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right text-white font-mono">
                                        ${stat?.price.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-right text-zinc-400">
                                        {stat?.volume24h}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                                            {isPositive ? '+' : ''}{stat?.change24h.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end">
                                            <svg width="120" height="40" className="opacity-80">
                                                <path
                                                    d={`M 0,${20 + (Math.random() - 0.5) * 10} ${Array.from(
                                                        { length: 20 },
                                                        (_, i) => `L ${i * 6},${20 + (Math.random() - 0.5) * 15}`
                                                    ).join(' ')}`}
                                                    fill="none"
                                                    stroke={isPositive ? '#10b981' : '#ef4444'}
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

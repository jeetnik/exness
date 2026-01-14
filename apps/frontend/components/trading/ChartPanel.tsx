"use client";

import { useState } from 'react';
import { TradingChart } from './TradingChart';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '1d', '1w'];
const POPULAR_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

interface ChartPanelProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
}

export function ChartPanel({ selectedSymbol, onSymbolChange }: ChartPanelProps) {
    const [timeframe, setTimeframe] = useState('1m');

    return (
        <div className="h-full flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 gap-1.5 font-semibold text-sm px-2">
                                <span className="text-white">{selectedSymbol}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44 bg-zinc-900 border-zinc-800">
                            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-400">
                                Popular Pairs
                            </div>
                            {POPULAR_PAIRS.map(pair => (
                                <DropdownMenuItem
                                    key={pair}
                                    onClick={() => onSymbolChange(pair)}
                                    className={`${selectedSymbol === pair
                                            ? 'bg-zinc-800 text-white'
                                            : 'text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                >
                                    <span className="font-medium text-sm">{pair}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-0.5">
                        {TIMEFRAMES.map(tf => (
                            <Button
                                key={tf}
                                variant="ghost"
                                size="sm"
                                onClick={() => setTimeframe(tf)}
                                className={`h-7 px-2.5 text-xs font-medium transition-colors ${timeframe === tf
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                {tf}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <TradingChart symbol={selectedSymbol} timeframe={timeframe} />
            </div>
        </div>
    );
}

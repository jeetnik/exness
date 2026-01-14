"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const TradingShowcase = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#71717a', // zinc-400
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
                visible: true,
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            }
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', // emerald-500
            downColor: '#ef4444', // red-500
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        // Generate some fake data
        const data = [];
        let price = 45000;
        const now = new Date();
        for (let i = 0; i < 100; i++) {
            const time = (now.getTime() / 1000) - (100 - i) * 60;
            // More volatile movement
            const volatility = 50;
            const change = (Math.random() - 0.5) * volatility;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * 0.5;
            price = close;

            data.push({
                time: time as any,
                open,
                high,
                low,
                close,
            });
        }

        candlestickSeries.setData(data);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Main Chart Container */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="h-12 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-zinc-300">BTC/USD Perpetual</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="text-green-500">24h +5.2%</span>
                        <span>Vol 2.4M</span>
                    </div>
                </div>

                {/* Chart Area */}
                <div ref={chartContainerRef} className="w-full h-[350px]" />
            </div>

            {/* Floating Card: Profitable Trade */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 -top-6 md:-right-12 md:top-8 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-xl min-w-[200px] z-20 group hover:border-green-500/30 transition-colors"
            >
                <div className="text-xs text-zinc-400 mb-1">Unrealized P&L</div>
                <div className="text-2xl font-bold text-green-400 font-mono flex items-center gap-2">
                    +$1,250.40
                    <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-green-500"
                    />
                </div>
            </motion.div>

            {/* Floating Card: Leverage Info */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -left-4 bottom-8 md:-left-12 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-xl min-w-[180px] z-20"
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-400">Leverage</span>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">20x</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-xs text-zinc-400">Size</span>
                    <span className="text-xs font-mono text-white">2.5 BTC</span>
                </div>

                <div className="w-full h-1 bg-zinc-800 mt-3 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    />
                </div>
            </motion.div>
        </div>
    );
};

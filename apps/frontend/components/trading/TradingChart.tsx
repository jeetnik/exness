"use client";

import { useEffect, useRef } from "react";
import {
    createChart,
    IChartApi,
    CandlestickSeries,
    CandlestickData,
    Time,
} from "lightweight-charts";
import { apiClient } from "@/lib/api-client";
import { wsClient, MarketData } from "@/lib/websocket-client";

interface CandleFromAPI {
    timestamp: number;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    decimal: number;
}

export function TradingChart({ symbol, timeframe }: any) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<any>(null);
    const currentCandleRef = useRef<CandlestickData | null>(null);

    // Initialize chart once
    useEffect(() => {
        if (!containerRef.current) return;

        console.log("[Chart] Initializing chart");

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            layout: {
                background: { color: "#09090b" },
                textColor: "#a1a1aa",
            },
            grid: {
                vertLines: { color: "#18181b" },
                horzLines: { color: "#18181b" },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            autoSize: true,
        });

        // ✅ v5 CORRECT WAY
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
            borderVisible: false,
        });

        chartRef.current = chart;
        seriesRef.current = candleSeries;

        console.log("[Chart] Chart initialized successfully");

        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && chartRef.current) {
                chart.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            console.log("[Chart] Cleaning up chart");
            resizeObserver.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    // Load historical data when symbol/timeframe changes
    useEffect(() => {
        if (!seriesRef.current) return;

        const loadHistoricalData = async () => {
            try {
                console.log(`[Chart] Fetching data for ${symbol} ${timeframe}`);

                const now = Math.floor(Date.now() / 1000);
                const timeRanges: Record<string, number> = {
                    "1m": 29 * 24 * 60 * 60,
                    "5m": 89 * 24 * 60 * 60,
                    "15m": 179 * 24 * 60 * 60,
                    "30m": 364 * 24 * 60 * 60,
                    "1h": 2 * 364 * 24 * 60 * 60,
                    "1d": 5 * 364 * 24 * 60 * 60,
                    "1w": 10 * 364 * 24 * 60 * 60,
                };

                const range = timeRanges[timeframe] || 24 * 60 * 60;
                const startTime = now - range;

                console.log(
                    `[Chart] Requesting candles from ${startTime} to ${now}`
                );
                const response = await apiClient.getCandles(
                    symbol,
                    timeframe,
                    startTime,
                    now
                );
                console.log(`[Chart] Received response:`, response);

                if (response.candles && response.candles.length > 0) {
                    const chartData: CandlestickData[] = response.candles
                        .map((candle: CandleFromAPI) => {
                            const divisor = Math.pow(10, candle.decimal);
                            return {
                                time: candle.timestamp as Time,
                                open: candle.open / divisor,
                                high: candle.high / divisor,
                                low: candle.low / divisor,
                                close: candle.close / divisor,
                            };
                        })
                        .sort((a, b) => {
                            const timeA =
                                typeof a.time === "number"
                                    ? a.time
                                    : Number(a.time);
                            const timeB =
                                typeof b.time === "number"
                                    ? b.time
                                    : Number(b.time);
                            return timeA - timeB;
                        });

                    console.log(`[Chart] Processed ${chartData.length} candles`);
                    console.log(`[Chart] Sample candle:`, chartData[0]);

                    if (seriesRef.current) {
                        seriesRef.current.setData(chartData);
                        chartRef.current?.timeScale().fitContent();
                        console.log("[Chart] Data loaded successfully");
                    }
                } else {
                    console.log("[Chart] No candles in response");
                    if (seriesRef.current) {
                        seriesRef.current.setData([]);
                    }
                }
            } catch (err: any) {
                console.error("[Chart] Error fetching chart data:", err);
                console.error("[Chart] Error details:", err.response?.data);
            }
        };

        loadHistoricalData();
    }, [symbol, timeframe]);

    // Subscribe to live updates
    useEffect(() => {
        if (!seriesRef.current) return;

        const timeframeSeconds: Record<string, number> = {
            "1m": 60,
            "5m": 300,
            "15m": 900,
            "30m": 1800,
            "1h": 3600,
            "1d": 86400,
            "1w": 604800,
        };

        const candleDuration = timeframeSeconds[timeframe] || 60;

        const handler = (channel: string, marketData: MarketData) => {
            if (!seriesRef.current) return;

            const price = parseFloat(marketData.p);
            const timestamp = Math.floor(
                new Date(marketData.T).getTime() / 1000
            );
            const candleTime =
                Math.floor(timestamp / candleDuration) * candleDuration;

            const currentTime = currentCandleRef.current
                ? (typeof currentCandleRef.current.time === 'number'
                    ? currentCandleRef.current.time
                    : Number(currentCandleRef.current.time))
                : 0;

            if (!currentCandleRef.current || currentTime !== candleTime) {
                if (candleTime < currentTime) {
                    console.warn('[Chart] Ignoring old data:', {
                        candleTime,
                        currentTime,
                    });
                    return;
                }

                currentCandleRef.current = {
                    time: candleTime as Time,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };
            } else {
                currentCandleRef.current.high = Math.max(
                    currentCandleRef.current.high,
                    price
                );
                currentCandleRef.current.low = Math.min(
                    currentCandleRef.current.low,
                    price
                );
                currentCandleRef.current.close = price;
            }

            try {
                seriesRef.current.update(currentCandleRef.current);
            } catch (error) {
                console.error('[Chart] Error updating candle:', error);
            }
        };

        wsClient.subscribe([symbol], handler);

        return () => {
            wsClient.unsubscribe([symbol], handler);
            currentCandleRef.current = null;
        };
    }, [symbol, timeframe]);

    return <div ref={containerRef} className="w-full h-full" />;
}

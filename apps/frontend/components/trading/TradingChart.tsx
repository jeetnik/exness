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
    const lastHistoricalTimeRef = useRef<number>(0);
    // Flag to prevent WebSocket updates while loading historical data
    const isLoadingRef = useRef<boolean>(false);

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

        // IMPORTANT: Reset refs synchronously BEFORE async fetch to prevent race conditions
        console.log(`[Chart] Resetting refs for new timeframe: ${timeframe}`);
        currentCandleRef.current = null;
        lastHistoricalTimeRef.current = 0;
        isLoadingRef.current = true;

        const loadHistoricalData = async () => {
            try {
                console.log(`[Chart] Fetching data for ${symbol} ${timeframe}`);

                const now = Math.floor(Date.now() / 1000);
                // Time ranges optimized for good default zoom (showing ~100-200 candles)
                const timeRanges: Record<string, number> = {
                    "1m": 4 * 60 * 60,          // 4 hours = ~240 candles
                    "5m": 12 * 60 * 60,         // 12 hours = ~144 candles
                    "15m": 2 * 24 * 60 * 60,    // 2 days = ~192 candles
                    "30m": 4 * 24 * 60 * 60,    // 4 days = ~192 candles
                    "1h": 7 * 24 * 60 * 60,     // 7 days = ~168 candles
                    "1d": 180 * 24 * 60 * 60,   // 180 days = ~180 candles
                    "1w": 2 * 365 * 24 * 60 * 60, // 2 years = ~104 candles
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
                    const sortedData: CandlestickData[] = response.candles
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
                        .sort((a: CandlestickData, b: CandlestickData) => {
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

                    // Deduplicate: keep only the last entry for each timestamp
                    const deduplicatedMap = new Map<number, CandlestickData>();
                    for (const candle of sortedData) {
                        const t = typeof candle.time === "number" ? candle.time : Number(candle.time);
                        deduplicatedMap.set(t, candle);
                    }
                    const chartData = Array.from(deduplicatedMap.values()).sort((a, b) => {
                        const timeA = typeof a.time === "number" ? a.time : Number(a.time);
                        const timeB = typeof b.time === "number" ? b.time : Number(b.time);
                        return timeA - timeB;
                    });

                    console.log(`[Chart] Processed ${chartData.length} candles (after dedup)`);
                    console.log(`[Chart] Sample candle:`, chartData[0]);

                    if (seriesRef.current) {
                        seriesRef.current.setData(chartData);

                        // Scroll to show recent data with ~100 visible candles
                        const timeScale = chartRef.current?.timeScale();
                        if (timeScale && chartData.length > 0) {
                            // Show the last ~100 candles (or all if less than 100)
                            const visibleCandles = Math.min(100, chartData.length);
                            const fromIndex = chartData.length - visibleCandles;
                            timeScale.setVisibleLogicalRange({
                                from: fromIndex,
                                to: chartData.length - 1,
                            });
                        }
                        console.log("[Chart] Data loaded successfully");

                        // Initialize currentCandleRef with the last candle
                        if (chartData.length > 0) {
                            const lastCandle = chartData[chartData.length - 1];
                            currentCandleRef.current = { ...lastCandle };
                            lastHistoricalTimeRef.current = typeof lastCandle.time === "number"
                                ? lastCandle.time
                                : Number(lastCandle.time);
                        }
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
            } finally {
                // Allow live updates after historical data is loaded
                isLoadingRef.current = false;
                console.log("[Chart] Loading complete, live updates enabled");
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
            // Skip updates while loading historical data
            if (isLoadingRef.current) {
                return;
            }

            if (!seriesRef.current || !currentCandleRef.current) {
                return;
            }

            const price = parseFloat(marketData.p);
            if (isNaN(price)) {
                console.warn('[Chart] Invalid price received:', marketData.p);
                return;
            }

            const timestamp = Math.floor(
                new Date(marketData.T).getTime() / 1000
            );
            if (isNaN(timestamp) || timestamp <= 0) {
                console.warn('[Chart] Invalid timestamp received:', marketData.T);
                return;
            }

            const candleTime =
                Math.floor(timestamp / candleDuration) * candleDuration;

            const currentTime = typeof currentCandleRef.current.time === 'number'
                ? currentCandleRef.current.time
                : Number(currentCandleRef.current.time);

            if (currentTime !== candleTime) {
                // Skip if this candle is older than our historical data
                if (candleTime < lastHistoricalTimeRef.current) {
                    return;
                }

                // Skip if this is older than the current candle (out-of-order data)
                if (candleTime < currentTime) {
                    console.warn('[Chart] Ignoring old data:', {
                        candleTime,
                        currentTime,
                    });
                    return;
                }

                // Create a new candle
                currentCandleRef.current = {
                    time: candleTime as Time,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };
            } else {
                // Update the existing candle
                currentCandleRef.current = {
                    ...currentCandleRef.current,
                    high: Math.max(currentCandleRef.current.high, price),
                    low: Math.min(currentCandleRef.current.low, price),
                    close: price,
                };
            }

            try {
                seriesRef.current.update(currentCandleRef.current);
            } catch (error) {
                console.error('[Chart] Error updating candle:', error, currentCandleRef.current);
            }
        };

        wsClient.subscribe([symbol], handler);

        return () => {
            wsClient.unsubscribe([symbol], handler);
        };
    }, [symbol, timeframe]);

    return <div ref={containerRef} className="w-full h-full" />;
}

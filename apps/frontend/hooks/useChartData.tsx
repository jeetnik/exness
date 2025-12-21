"use client";

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { wsClient, MarketData } from '@/lib/websocket-client';
import type { CandlestickData, Time } from 'lightweight-charts';

interface CandleFromAPI {
    timestamp: number;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    decimal: number;
}

export function useChartData(symbol: string, timeframe: string) {
    const [data, setData] = useState<CandlestickData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentCandleRef = useRef<CandlestickData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(`[Chart] Fetching data for ${symbol} ${timeframe}`);

                const now = Math.floor(Date.now() / 1000);
                const timeRanges: Record<string, number> = {
                    '1m': 29 * 24 * 60 * 60,
                    '5m': 89 * 24 * 60 * 60,
                    '15m': 179 * 24 * 60 * 60,
                    '30m': 364 * 24 * 60 * 60,
                    '1h': 2 * 364 * 24 * 60 * 60,
                    '1d': 5 * 364 * 24 * 60 * 60,
                    '1w': 10 * 364 * 24 * 60 * 60,
                };

                const range = timeRanges[timeframe] || 24 * 60 * 60;
                const startTime = now - range;

                console.log(`[Chart] Requesting candles from ${startTime} to ${now}`);
                const response = await apiClient.getCandles(symbol, timeframe, startTime, now);
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
                            const timeA = typeof a.time === 'number' ? a.time : Number(a.time);
                            const timeB = typeof b.time === 'number' ? b.time : Number(b.time);
                            return timeA - timeB;
                        });

                    console.log(`[Chart] Processed ${chartData.length} candles`);
                    console.log(`[Chart] Sample candle:`, chartData[0]);
                    setData(chartData);
                } else {
                    console.log('[Chart] No candles in response, using live data');
                    setData([]);
                }
            } catch (err: any) {
                console.error('[Chart] Error fetching chart data:', err);
                console.error('[Chart] Error details:', err.response?.data);
                setError(err.response?.data?.error || err.message || 'Failed to load chart data');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, timeframe]);

    useEffect(() => {
        const timeframeSeconds: Record<string, number> = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '30m': 1800,
            '1h': 3600,
            '1d': 86400,
            '1w': 604800,
        };

        const candleDuration = timeframeSeconds[timeframe] || 60;

        const handler = (channel: string, marketData: MarketData) => {
            const price = parseFloat(marketData.p);
            const timestamp = Math.floor(new Date(marketData.T).getTime() / 1000);
            const candleTime = Math.floor(timestamp / candleDuration) * candleDuration;

            setData(prevData => {
                if (prevData.length === 0) {
                    const newCandle: CandlestickData = {
                        time: candleTime as Time,
                        open: price,
                        high: price,
                        low: price,
                        close: price,
                    };
                    currentCandleRef.current = newCandle;
                    return [newCandle];
                }

                const lastCandle = prevData[prevData.length - 1];
                const lastCandleTime = typeof lastCandle.time === 'number' ? lastCandle.time : Number(lastCandle.time);

                if (candleTime === lastCandleTime) {
                    const updatedCandle: CandlestickData = {
                        time: candleTime as Time,
                        open: lastCandle.open,
                        high: Math.max(lastCandle.high, price),
                        low: Math.min(lastCandle.low, price),
                        close: price,
                    };
                    currentCandleRef.current = updatedCandle;
                    return [...prevData.slice(0, -1), updatedCandle];
                } else if (candleTime > lastCandleTime) {
                    const newCandle: CandlestickData = {
                        time: candleTime as Time,
                        open: price,
                        high: price,
                        low: price,
                        close: price,
                    };
                    currentCandleRef.current = newCandle;
                    return [...prevData, newCandle];
                }

                return prevData;
            });
        };

        wsClient.subscribe([symbol], handler);

        return () => {
            wsClient.unsubscribe([symbol], handler);
            currentCandleRef.current = null;
        };
    }, [symbol, timeframe]);

    return { data, loading, error };
}

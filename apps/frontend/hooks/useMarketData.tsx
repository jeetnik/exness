"use client";

import { useState, useEffect } from 'react';
import { wsClient, MarketData } from '@/lib/websocket-client';

export interface LiveMarketData {
    symbol: string;
    price: number;
    timestamp: number;
}

export function useMarketData(symbols: string[]) {
    const [marketData, setMarketData] = useState<Map<string, LiveMarketData>>(new Map());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        wsClient.connect();
        setIsConnected(wsClient.isConnected);

        const intervalId = setInterval(() => {
            setIsConnected(wsClient.isConnected);
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (symbols.length === 0) return;

        const handler = (channel: string, data: MarketData) => {
            const price = parseFloat(data.p);
            const timestamp = new Date(data.T).getTime();

            setMarketData(prev => {
                const newData = new Map(prev);
                newData.set(channel, {
                    symbol: channel,
                    price,
                    timestamp,
                });
                return newData;
            });
        };

        wsClient.subscribe(symbols, handler);

        return () => {
            wsClient.unsubscribe(symbols, handler);
        };
    }, [symbols.join(',')]);

    return { marketData, isConnected };
}

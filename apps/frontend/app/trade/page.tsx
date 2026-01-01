"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/trading/Header';
import { ChartPanel } from '@/components/trading/ChartPanel';
import { TradePanel } from '@/components/trading/TradePanel';
import { OrdersPanel } from '@/components/trading/OrdersPanel';
import { MarketData } from '@/components/trading/MarketData';
import { AuthModal } from '@/components/trading/AuthModal';
import { useMarketData } from '@/hooks/useMarketData';
import { apiClient } from '@/lib/api-client';

const TRADING_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

export default function TradingPage() {
    const searchParams = useSearchParams();
    const symbolFromUrl = searchParams.get('symbol');

    const [selectedSymbol, setSelectedSymbol] = useState(symbolFromUrl || 'BTCUSDT');
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

    const { marketData } = useMarketData([selectedSymbol]);
    const currentPrice = marketData.get(selectedSymbol)?.price || null;

    useEffect(() => {
        if (symbolFromUrl && symbolFromUrl !== selectedSymbol) {
            setSelectedSymbol(symbolFromUrl);
        }
    }, [symbolFromUrl]);

    const handleSignIn = () => {
        setAuthMode('signin');
        setAuthModalOpen(true);
    };

    const handleSignUp = () => {
        setAuthMode('signup');
        setAuthModalOpen(true);
    };

    return (
        <div className="h-screen flex flex-col bg-black min-w-[1200px] overflow-hidden">
            <Header onSignIn={handleSignIn} onSignUp={handleSignUp} showNav={true} />

            <div className="flex-1 grid grid-cols-12 gap-2 p-2 overflow-hidden min-h-0">
                {/* Left - Chart */}
                <div className="col-span-7 flex flex-col gap-2 h-full min-w-0">
                    <div className="flex-1 min-h-0">
                        <ChartPanel
                            selectedSymbol={selectedSymbol}
                            onSymbolChange={setSelectedSymbol}
                        />
                    </div>
                </div>

                {/* Center - Order Book & Trades */}
                <div className="col-span-2 h-full min-w-0 overflow-hidden flex flex-col">
                    <div className="flex-1 min-h-0">
                        <MarketData symbol={selectedSymbol} />
                    </div>
                </div>

                {/* Right - Trade Panel */}
                <div className="col-span-3 h-full min-w-0 flex flex-col gap-2">
                    <div className="flex-1 min-h-0">
                        <TradePanel
                            symbol={selectedSymbol}
                            currentPrice={currentPrice}
                            onAuthRequired={handleSignIn}
                        />
                    </div>
                </div>
            </div>

            <div className="px-2 pb-2 h-[150px]">
                <OrdersPanel />
            </div>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
}

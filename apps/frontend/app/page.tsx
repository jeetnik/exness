"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/trading/Header';
import { ChartPanel } from '@/components/trading/ChartPanel';
import { TradePanel } from '@/components/trading/TradePanel';
import { LiveMarkets } from '@/components/trading/LiveMarkets';
import { WalletPanel } from '@/components/trading/WalletPanel';
import { OrdersPanel } from '@/components/trading/OrdersPanel';
import { AuthModal } from '@/components/trading/AuthModal';
import { useMarketData } from '@/hooks/useMarketData';
import { apiClient } from '@/lib/api-client';

const TRADING_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

export default function TradingPage() {
    const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [availableSymbols, setAvailableSymbols] = useState<string[]>(TRADING_PAIRS);

    const { marketData } = useMarketData([selectedSymbol]);
    const currentPrice = marketData.get(selectedSymbol)?.price || null;

    // Fetch available symbols from backend
    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                const data = await apiClient.getChannels();
                if (data.channels && data.channels.length > 0) {
                    setAvailableSymbols(data.channels);
                }
            } catch (error) {
                console.error('Failed to fetch channels:', error);
            }
        };
        fetchSymbols();
    }, []);

    const handleSignIn = () => {
        setAuthMode('signin');
        setAuthModalOpen(true);
    };

    const handleSignUp = () => {
        setAuthMode('signup');
        setAuthModalOpen(true);
    };

    return (
        <div className="h-screen flex flex-col bg-black">
            <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

            <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
                {/* Left - Chart */}
                <div className="col-span-9 flex flex-col gap-4 h-full">
                    <div className="flex-[3] min-h-0">
                        <ChartPanel
                            selectedSymbol={selectedSymbol}
                            onSymbolChange={setSelectedSymbol}
                        />
                    </div>
                    <div className="flex-[1] min-h-[200px] max-h-[280px] overflow-hidden">
                        <OrdersPanel />
                    </div>
                </div>

                {/* Right Sidebar - Wallet, Trading & Markets */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto">
                    <WalletPanel onSignIn={handleSignIn} />
                    <TradePanel
                        symbol={selectedSymbol}
                        currentPrice={currentPrice}
                        onAuthRequired={handleSignIn}
                    />
                    <LiveMarkets
                        symbols={availableSymbols}
                        selectedSymbol={selectedSymbol}
                        onSymbolClick={setSelectedSymbol}
                    />
                </div>
            </div>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
}

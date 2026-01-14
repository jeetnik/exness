"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/trading/Header';
import { TradingSidebar } from '@/components/trading/TradingSidebar';
import { ChartPanel } from '@/components/trading/ChartPanel';
import { TradePanel } from '@/components/trading/TradePanel';
import { LiveMarkets } from '@/components/trading/LiveMarkets';
import { OrdersPanel } from '@/components/trading/OrdersPanel';
import { WalletPanel } from '@/components/trading/WalletPanel';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { AuthModal } from '@/components/trading/AuthModal';
import { useMarketData } from '@/hooks/useMarketData';

const TRADING_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

function TradingPageContent() {
    const searchParams = useSearchParams();
    const symbolFromUrl = searchParams.get('symbol');

    const [selectedSymbol, setSelectedSymbol] = useState(symbolFromUrl || 'BTCUSDT');
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

    const [activeTab, setActiveTab] = useState('dashboard');

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
        <div className="h-screen flex bg-black min-w-[1200px] overflow-hidden font-sans">
            {/* Sidebar */}
            <TradingSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onSignIn={handleSignIn} onSignUp={handleSignUp} showNav={false} showBranding={false} className="border-b border-[#2A2A2A] bg-black" />

                {activeTab === 'market' ? (
                    <div className="p-6 h-full bg-black">
                        <div className="max-w-7xl mx-auto">
                            <LiveMarkets
                                symbols={TRADING_PAIRS}
                                selectedSymbol={selectedSymbol}
                                onSymbolClick={(symbol) => {
                                    setSelectedSymbol(symbol);
                                    setActiveTab('dashboard');
                                }}
                            />
                        </div>
                    </div>
                ) : activeTab === 'positions' ? (
                    <div className="p-6 h-full bg-black flex flex-col">
                        <h1 className="text-2xl font-bold text-white mb-6">Your Positions</h1>
                        <div className="flex-1 min-h-0">
                            <OrdersPanel />
                        </div>
                    </div>
                ) : activeTab === 'portfolio' ? (
                    <div className="p-6 h-full bg-black flex flex-col">
                        <div className="max-w-2xl mx-auto w-full">
                            <h1 className="text-2xl font-bold text-white mb-6">Portfolio Overview</h1>
                            <WalletPanel onSignIn={handleSignIn} />
                        </div>
                    </div>
                ) : activeTab === 'history' ? (
                    <div className="p-6 h-full bg-black flex flex-col">
                        <h1 className="text-2xl font-bold text-white mb-6">Recent Market Trades</h1>
                        <div className="flex-1 min-h-0">
                            <RecentTrades symbol={selectedSymbol} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 grid grid-cols-12 gap-2 p-2 overflow-hidden min-h-0">
                            {/* Left - Chart */}
                            <div className="col-span-9 flex flex-col gap-2 h-full min-w-0">
                                <div className="flex-1 min-h-0">
                                    <ChartPanel
                                        selectedSymbol={selectedSymbol}
                                        onSymbolChange={setSelectedSymbol}
                                    />
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
                    </>
                )}
            </div>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
}

// Loading fallback component
function TradingPageLoading() {
    return (
        <div className="h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-white mx-auto mb-4"></div>
                <p className="text-zinc-400">Loading trading platform...</p>
            </div>
        </div>
    );
}

// Main export wrapped in Suspense
export default function TradingPage() {
    return (
        <Suspense fallback={<TradingPageLoading />}>
            <TradingPageContent />
        </Suspense>
    );
}

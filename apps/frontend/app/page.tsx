"use client";

import { PaperHero } from '@/components/landing/PaperHero';
import { Features } from '@/components/landing/Features';
import { Ticker } from '@/components/landing/Ticker';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/trading/Header';
import { AuthModal } from '@/components/trading/AuthModal';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const router = useRouter();

    const handleSignIn = () => {
        setAuthMode('signin');
        setAuthModalOpen(true);
    };

    const handleSignUp = () => {
        setAuthMode('signup');
        setAuthModalOpen(true);
    };

    const handleViewDemo = () => {
        router.push('/trade');
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
            <Header onSignIn={handleSignIn} onSignUp={handleSignUp} showNav={true} />

            <main>
                <PaperHero
                    onStartTrading={handleViewDemo}
                    onViewDemo={handleViewDemo}
                />
                <Ticker />
                <Features />
            </main>
            <Footer />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
}

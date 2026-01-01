"use client";

import { HeroSection } from '@/components/landing/HeroSection';
import { LiveMarketsTable } from '@/components/landing/LiveMarketsTable';
import { Header } from '@/components/trading/Header';
import { AuthModal } from '@/components/trading/AuthModal';
import { useState } from 'react';

export default function LandingPage() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

    const handleSignIn = () => {
        setAuthMode('signin');
        setAuthModalOpen(true);
    };

    const handleSignUp = () => {
        setAuthMode('signup');
        setAuthModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-black">
            <Header onSignIn={handleSignIn} onSignUp={handleSignUp} showNav={true} />
            <HeroSection />
            <LiveMarketsTable />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
}

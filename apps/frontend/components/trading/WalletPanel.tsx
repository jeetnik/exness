"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface WalletPanelProps {
    onSignIn: () => void;
}

export function WalletPanel({ onSignIn }: WalletPanelProps) {
    const { isAuthenticated, balance, lockedBalance, totalBalance } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Sign in to view your balance and start trading
                </p>
                <Button
                    onClick={onSignIn}
                    className="w-full bg-white text-black hover:bg-white/90"
                >
                    Sign In
                </Button>
            </div>
        );
    }

    const totalBalanceUsd = totalBalance ? (totalBalance / 100).toFixed(2) : '0.00';
    const availableBalanceUsd = balance ? (balance / 100).toFixed(2) : '0.00';
    const lockedBalanceUsd = lockedBalance ? (lockedBalance / 100).toFixed(2) : '0.00';

    return (
        <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                    <div className="text-xs text-zinc-400">Total Balance</div>
                    <div className="text-2xl font-bold text-white">
                        ${totalBalanceUsd}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800">
                <div>
                    <div className="text-xs text-zinc-400">Available</div>
                    <div className="text-sm font-semibold text-green-500">${availableBalanceUsd}</div>
                </div>
                <div>
                    <div className="text-xs text-zinc-400">In Orders</div>
                    <div className="text-sm font-semibold text-white">${lockedBalanceUsd}</div>
                </div>
            </div>
        </div>
    );
}

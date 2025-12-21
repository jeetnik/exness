"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface WalletPanelProps {
    onSignIn: () => void;
}

export function WalletPanel({ onSignIn }: WalletPanelProps) {
    const { isAuthenticated, balance } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-600/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Sign in to view your balance and start trading
                </p>
                <Button
                    onClick={onSignIn}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white"
                >
                    Sign In
                </Button>
            </div>
        );
    }

    const balanceUsd = balance ? (balance / 100).toFixed(2) : '0.00';

    return (
        <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                    <div className="text-xs text-zinc-400">Total Balance</div>
                    <div className="text-2xl font-bold text-white">
                        ${balanceUsd}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800">
                <div>
                    <div className="text-xs text-zinc-400">Available</div>
                    <div className="text-sm font-semibold text-green-500">${balanceUsd}</div>
                </div>
                <div>
                    <div className="text-xs text-zinc-400">In Orders</div>
                    <div className="text-sm font-semibold text-orange-500">$0.00</div>
                </div>
            </div>
        </div>
    );
}

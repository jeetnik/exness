"use client";

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

interface HeaderProps {
    onSignIn: () => void;
    onSignUp: () => void;
    showNav?: boolean;
    showBranding?: boolean;
    className?: string;
}

export function Header({ onSignIn, onSignUp, showNav = false, showBranding = true, className }: HeaderProps) {
    const { isAuthenticated, balance, logout } = useAuth();

    return (
        <header className={cn("border-b border-zinc-800 bg-zinc-950", className)}>
            <div className="px-6 py-4 flex items-center justify-between relative">
                {/* Left: Branding */}
                <div className="flex items-center">
                    {showBranding && (
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">
                                Paper
                            </span>
                            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center p-1.5">
                                <img
                                    src="/favicon.ico"
                                    alt="Paper Trade"
                                    className="w-full h-full brightness-0 invert"
                                />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Trade
                            </span>
                        </Link>
                    )}
                </div>

                {/* Center: Navigation */}
                {showNav && (
                    <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <Link
                            href="/trade"
                            className="px-4 py-2 rounded-lg text-base font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/#markets"
                            className="px-4 py-2 rounded-lg text-base font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            Market
                        </Link>
                    </nav>
                )}

                {/* Right: Auth buttons */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <div className="text-right mr-2">
                                <div className="text-xs text-zinc-400">Balance</div>
                                <div className="text-sm font-semibold text-white">
                                    ${balance ? (balance / 100).toFixed(2) : '0.00'}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-9 w-9 p-0">
                                        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-semibold">
                                            U
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                                    <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="text-red-500 hover:bg-zinc-800 cursor-pointer"
                                    >
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={onSignIn}
                                variant="ghost"
                                className="text-white hover:bg-zinc-800"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={onSignUp}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

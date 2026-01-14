"use client";

import {
    LayoutGrid,
    BarChart2,
    List,
    Wallet,
    History,
    Settings,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", id: "dashboard" },
    { icon: BarChart2, label: "Market", id: "market" },
    { icon: List, label: "Positions", id: "positions" },
    { icon: Wallet, label: "Portfolio", id: "portfolio" },
    { icon: History, label: "History", id: "history" },
];

interface TradingSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function TradingSidebar({ activeTab, onTabChange }: TradingSidebarProps) {

    return (
        <div className="h-screen w-64 bg-black border-r border-[#2A2A2A] flex flex-col shrink-0 font-sans">
            {/* Header / Logo */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-white/10 transition-colors">
                        <img
                            src="/favicon.ico"
                            alt="Logo"
                            className="w-full h-full object-contain brightness-0 invert"
                        />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight group-hover:text-zinc-200 transition-colors">Paper</h1>
                        <p className="text-zinc-500 text-xs">Trading Platform</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            activeTab === item.id
                                ? "bg-[rgba(255,255,255,0.08)] text-white"
                                : "text-[#888888] hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-[#666666] group-hover:text-white")} />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Bottom Info */}
            <div className="p-4 mt-auto">
                {/* User Profile */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold shadow-lg">
                        T
                    </div>
                    <div>
                        <div className="text-white text-sm font-medium">Trader</div>
                        <div className="text-zinc-500 text-xs group-hover:text-zinc-400 transition-colors">Free Account</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

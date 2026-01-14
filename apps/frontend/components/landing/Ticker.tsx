"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const tickers = [
    { symbol: "BTC/USD", price: "45,230.50", change: "+2.4%", isUp: true },
    { symbol: "ETH/USD", price: "2,450.10", change: "+1.8%", isUp: true },
    { symbol: "SOL/USD", price: "98.45", change: "-0.5%", isUp: false },
    { symbol: "XRP/USD", price: "0.54", change: "+0.2%", isUp: true },
    { symbol: "ADA/USD", price: "0.48", change: "-1.1%", isUp: false },
    { symbol: "AVAX/USD", price: "34.20", change: "+3.5%", isUp: true },
    { symbol: "DOT/USD", price: "6.80", change: "-0.8%", isUp: false },
    { symbol: "MATIC/USD", price: "0.85", change: "+1.2%", isUp: true },
];

export const Ticker = () => {
    return (
        <div className="w-full bg-zinc-950 border-y border-white/5 py-4 overflow-hidden flex relative z-20">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

            <motion.div
                className="flex gap-16 whitespace-nowrap" // increased gap
                animate={{ x: "-50%" }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20, // slower duration
                }}
                style={{ width: "max-content" }} // ensure container fits content
            >
                {[...tickers, ...tickers, ...tickers, ...tickers].map((ticker, i) => ( // Repeat more times to fill wide screens
                    <div key={i} className="flex items-center gap-3">
                        <span className="font-bold text-zinc-300">{ticker.symbol}</span>
                        <span className="font-mono text-zinc-400">{ticker.price}</span>
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded",
                            ticker.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {ticker.change}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

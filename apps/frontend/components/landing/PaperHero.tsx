"use client";

import { ShinyButton } from "@/components/ui/shiny-button";
import { TradingShowcase } from "./TradingShowcase";
import { motion } from "framer-motion";

interface PaperHeroProps {
    onStartTrading?: () => void;
    onViewDemo?: () => void;
}

export function PaperHero({ onStartTrading, onViewDemo }: PaperHeroProps) {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-black antialiased">
            {/* Background Grid - Replaced utility class with inline SVG for simplicity/reliability */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />




            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
                <div className="min-h-screen flex flex-col items-center justify-center py-20">


                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 mb-6 max-w-4xl"
                    >
                        Master the Markets with <br />
                        <span className="flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                            Paper
                            <img
                                src="/favicon.ico"
                                alt="Logo"
                                className="w-12 h-12 md:w-16 md:h-16 inline-block object-contain"
                                style={{ filter: "brightness(0) invert(1)" }}
                            />
                            Trading
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-10 leading-relaxed"
                    >
                        Experience the thrill of trading without the risk.
                        Real-time market data, advanced charting, and simulated execution.
                        Refine your strategy before you commit real capital.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 mb-20"
                    >
                        <ShinyButton
                            text="Start Trading Now"
                            className="bg-white/10 text-white min-w-[200px]"
                            onClick={onStartTrading}
                        />
                        <button
                            onClick={onViewDemo}
                            className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors font-bold border border-transparent hover:border-zinc-800"
                        >
                            View Live Demo
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="w-full relative z-20 perspective-1000 mb-20"
                >
                    <div className="transform transition-transform duration-500 hover:scale-[1.01]">
                        <TradingShowcase />
                    </div>
                </motion.div>
            </div>

        </section >
    );
}

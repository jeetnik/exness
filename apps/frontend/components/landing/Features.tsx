"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "Market Depth",
        subtitle: "Live Orderbook",
        description: "Visualize buying and selling pressure in real-time with our high-frequency orderbook engine.",
        color: "bg-emerald-500",
        id: "orderbook",
        visual: (
            <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4 font-mono text-xs flex flex-col">
                <div className="flex justify-between text-zinc-500 mb-2 px-2">
                    <span>PRICE</span>
                    <span>AMT</span>
                    <span>TOTAL</span>
                </div>
                <div className="space-y-0.5 relative flex-1">
                    {/* Asks (Static Initial State for SSR) */}
                    {[
                        { p: "45,550", a: "0.45", t: "45k", w: "40%" },
                        { p: "45,500", a: "0.82", t: "42k", w: "60%" },
                        { p: "45,450", a: "1.20", t: "38k", w: "30%" }
                    ].map((row, i) => (
                        <div key={`ask-${i}`} className="flex justify-between px-2 py-0.5 relative group">
                            <div className="absolute inset-0 bg-red-500/10 right-0 ask-bar" style={{ width: row.w }} />
                            <span className="text-red-400 relative z-10">{row.p}</span>
                            <span className="text-zinc-300 relative z-10">{row.a}</span>
                            <span className="text-zinc-500 relative z-10">{row.t}</span>
                        </div>
                    ))}

                    <div className="py-2 text-center text-lg text-white font-bold border-y border-zinc-800 my-2 price-flash">
                        45,450.00
                    </div>

                    {/* Bids */}
                    {[
                        { p: "45,400", a: "0.95", t: "45k", w: "50%" },
                        { p: "45,350", a: "0.32", t: "46k", w: "20%" },
                        { p: "45,300", a: "2.10", t: "50k", w: "80%" }
                    ].map((row, i) => (
                        <div key={`bid-${i}`} className="flex justify-between px-2 py-0.5 relative">
                            <div className="absolute inset-0 bg-emerald-500/10 right-0 bid-bar" style={{ width: row.w }} />
                            <span className="text-emerald-400 relative z-10">{row.p}</span>
                            <span className="text-zinc-300 relative z-10">{row.a}</span>
                            <span className="text-zinc-500 relative z-10">{row.t}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        title: "Instant Execution",
        subtitle: "Low Latency",
        description: "Our matching engine processes trades in microseconds, ensuring you never miss a move.",
        color: "bg-amber-500",
        id: "execution",
        visual: (
            <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
                <div className="relative group">
                    {/* Rotating Rings */}
                    <div className="w-32 h-32 rounded-full border border-amber-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 exec-ring-1" />
                    <div className="w-24 h-24 rounded-full border-2 border-amber-500/30 flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 exec-ring-2">
                        <div className="w-16 h-16 rounded-full border-t-2 border-amber-500 exec-spinner" />
                    </div>
                    <div className="relative text-center z-10">
                        <div className="font-mono text-3xl font-bold text-white exec-text">1ms</div>
                        <div className="text-[10px] text-amber-500 uppercase tracking-wider">Latency</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Pro Analysis",
        subtitle: "Technical Charts",
        description: "Full-featured charting with over 100+ indicators and drawing tools for precise market analysis.",
        color: "bg-blue-500",
        id: "charts",
        visual: (
            <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="h-8 border-b border-zinc-800 flex items-center px-4 gap-2">
                    <div className="w-20 h-2 bg-zinc-800 rounded-full" />
                    <div className="w-10 h-2 bg-zinc-800 rounded-full ml-auto" />
                    <div className="w-4 h-4 rounded-full bg-blue-500/20" />
                </div>
                <div className="flex-1 relative p-4 flex items-end gap-1" id="chart-bars-container">
                    {[60, 45, 70, 30, 50, 80, 40, 65, 55, 75, 45, 60, 85, 50, 70].map((h, i) => (
                        <div
                            key={i}
                            className={cn("flex-1 rounded-sm chart-bar", i % 2 === 0 ? "bg-emerald-500" : "bg-red-500")}
                            style={{ height: `${h}%`, opacity: 0.7 }}
                        />
                    ))}
                </div>
            </div>
        )
    }
];

export function Features() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // 1. Header Animation
        gsap.from(headerRef.current, {
            scrollTrigger: {
                trigger: headerRef.current,
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        // 2. Card Entrances
        const cards = gsap.utils.toArray(".feature-card");
        cards.forEach((card: any, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 100,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: "back.out(1.7)"
            });
        });

        // 3. Feature Specific Animations

        // Orderbook Animation
        gsap.to(".ask-bar", {
            width: "random(10, 90)%",
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.1
        });
        gsap.to(".bid-bar", {
            width: "random(10, 90)%",
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.1
        });
        gsap.to(".price-flash", {
            color: "#10b981", // green-500
            duration: 0.2,
            repeat: -1,
            yoyo: true,
            repeatDelay: 2
        });

        // Execution Animation
        gsap.to(".exec-spinner", {
            rotation: 360,
            duration: 1,
            repeat: -1,
            ease: "none"
        });
        gsap.to(".exec-ring-1", {
            rotation: -360,
            duration: 3,
            repeat: -1,
            ease: "linear"
        });
        gsap.from(".exec-text", {
            scale: 1.5,
            opacity: 0,
            duration: 0.5,
            scrollTrigger: {
                trigger: ".exec-text",
                toggleActions: "play none none reverse"
            }
        });

        // Chart Animation
        gsap.from(".chart-bar", {
            scaleY: 0,
            transformOrigin: "bottom",
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
                trigger: "#chart-bars-container",
                toggleActions: "play none none reverse"
            }
        });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="py-32 bg-black relative overflow-hidden">
            {/* Decorative blobs */}
            {/* Decorative blobs removed */
            }

            <div className="container px-4 md:px-6 mx-auto">
                <div ref={headerRef} className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-6">
                        Institutional-Grade Features
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Built for traders who demand precision, speed, and reliability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="feature-card group relative p-1 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="absolute inset-0 bg-zinc-950/90 rounded-2xl z-0" />

                            <div className="relative z-10 h-full flex flex-col p-6">
                                <div className="mb-6 h-48 w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 group-hover:border-white/10 transition-colors">
                                    {feature.visual}
                                </div>

                                <div className="mt-auto">
                                    <span className={cn("text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-md bg-white/5 mb-3 inline-block", feature.color.replace('bg-', 'text-'))}>
                                        {feature.subtitle}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">
                                        {feature.title}
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

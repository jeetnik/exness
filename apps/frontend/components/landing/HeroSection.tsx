"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function HeroSection() {
    const router = useRouter();

    return (
        <div className="relative min-h-[200px] flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse"></div>
                    
                </div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                    Trade the Future
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 mb-12">
                    Professional cryptocurrency derivatives trading platform
                </p>
                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={() => router.push('/trade')}
                        className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-lg font-semibold rounded-lg"
                    >
                        Start Trading
                    </Button>
                    <Button
                        onClick={() => router.push('/trade')}
                        variant="outline"
                        className="border-zinc-700 text-white hover:bg-zinc-800 px-8 py-6 text-lg font-semibold rounded-lg"
                    >
                        View Markets
                    </Button>
                </div>
            </div>
        </div>
    );
}

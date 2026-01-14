import { Github, Linkedin } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export const Footer = () => {
    return (
        <footer className="bg-black border-t border-zinc-900 py-8">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-zinc-600">
                        © 2024 TradeX Flow Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="https://github.com/jeetnik/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/in/saijeet-nikam/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="https://x.com/nikamsaijeet" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <XIcon className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

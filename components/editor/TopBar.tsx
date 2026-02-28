import React from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const TopBar = () => {
    return (
        <header className="flex items-center justify-between h-12 px-4 bg-background border-b border-border-color shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 font-bold text-base text-foreground">
                    <div className="w-5 h-5 bg-[#6366f1] rounded-sm" />
                    <span>Editor</span>
                </div>

                <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Menu className="w-5 h-5" />
                </button>

                <input
                    type="text"
                    className="bg-transparent border-none text-foreground font-medium text-sm outline-none w-[200px]"
                    defaultValue="Design name"
                />
            </div>

            <div className="flex items-center gap-6">
                <a href="#" className="text-muted-foreground text-[13px] hover:text-foreground transition-colors">
                    For developers
                </a>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default TopBar;

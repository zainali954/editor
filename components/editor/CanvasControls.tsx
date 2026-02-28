import React from 'react';
import { Play, Minus, Plus, LayoutDashboard } from 'lucide-react';

const CanvasControls = () => {
    return (
        <div className="absolute inset-x-0 bottom-6 pointer-events-none flex items-center justify-between px-6">
            {/* Pages Button */}
            <div className="pointer-events-auto">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border-color rounded shadow-sm text-[13px] font-medium text-foreground hover:bg-brand-secondary transition-colors">
                    <Play className="w-4 h-4 fill-current opacity-70" />
                    Pages
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-background border border-border-color rounded shadow-sm overflow-hidden pointer-events-auto">
                <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-brand-secondary transition-all">
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="px-2 min-w-[48px] text-[13px] text-foreground text-center font-medium">
                    54%
                </div>
                <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-brand-secondary transition-all">
                    <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-border-color" />
                <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-brand-secondary transition-all">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Spacer */}
            <div className="w-16 h-8" />
        </div>
    );
};

export default CanvasControls;

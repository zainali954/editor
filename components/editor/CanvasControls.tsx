import React from 'react';
import { Play, Minus, Plus } from 'lucide-react';
import { useEditorStore } from '@/lib/store/editorStore';

const CanvasControls = () => {
    const { zoom, zoomIn, zoomOut, resetZoom } = useEditorStore();
    const zoomPercentage = Math.round(zoom * 100);

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
                <button 
                    onClick={zoomOut}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={zoom <= 0.1}
                    title="Zoom Out (Ctrl + Scroll)"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={resetZoom}
                    className="px-2 min-w-[48px] text-[13px] text-foreground text-center font-medium hover:bg-brand-secondary transition-all cursor-pointer"
                    title="Reset Zoom (100%)"
                >
                    {zoomPercentage}%
                </button>
                <button 
                    onClick={zoomIn}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={zoom >= 5}
                    title="Zoom In (Ctrl + Scroll)"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Spacer */}
            <div className="w-16 h-8" />
        </div>
    );
};

export default CanvasControls;

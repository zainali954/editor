import React from 'react';
import { Copy, Plus } from 'lucide-react';

const Canvas = () => {
    return (
        <main className="flex-1 bg-canvas-bg flex items-center justify-center relative overflow-hidden transition-colors">
            <div className="flex flex-col items-end gap-3 animate-in">
                {/* Page Actions */}
                <div className="flex gap-2 mr-1">
                    <button className="p-1 px-2 text-muted-text hover:text-foreground hover:bg-white dark:hover:bg-slate-800 rounded transition-all">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 px-2 text-muted-text hover:text-foreground hover:bg-white dark:hover:bg-slate-800 rounded transition-all">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* The Board - Uses theme variable for color */}
                <div className="w-[800px] h-[560px] bg-board-bg relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden shrink-0 group/board transition-all rounded-sm">
                    {/* Light dashed guide for the blank board */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
                        <div className="border-2 border-dashed border-foreground w-[96%] h-[96%] rounded" />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Canvas;

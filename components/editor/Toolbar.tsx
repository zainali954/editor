import React from 'react';
import {
    Undo2, Redo2, ChevronDown, ChevronUp, Bold, Italic,
    Underline, Strikethrough, List, Layers
} from 'lucide-react';

const Toolbar = () => {
    return (
        <div className="flex items-center h-10 px-4 bg-background border-b border-border-color shrink-0 gap-1">
            <div className="flex items-center gap-1">
                <button className="p-1.5 text-muted-foreground hover:bg-brand-secondary rounded">
                    <Undo2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-muted-foreground hover:bg-brand-secondary rounded">
                    <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-border-color mx-2" />

                <button className="w-5 h-5 bg-[#0284c7] rounded-sm mr-2" />

                <button className="flex items-center gap-1.5 text-[13px] text-foreground hover:bg-brand-secondary px-2 py-1 rounded">
                    Libre Baskervil...
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <div className="flex items-center border border-border-color rounded h-7 ml-1">
                    <input
                        type="text"
                        className="w-10 bg-transparent border-none text-foreground text-center text-xs outline-none"
                        defaultValue="66"
                    />
                    <div className="flex flex-col border-l border-border-color">
                        <button className="h-3.5 w-4 flex items-center justify-center hover:bg-brand-secondary transition-colors">
                            <ChevronUp className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button className="h-3.5 w-4 flex items-center justify-center hover:bg-brand-secondary transition-colors border-t border-border-color">
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-0.5 ml-2">
                    {[Bold, Italic, Underline, Strikethrough, List].map((Icon, idx) => (
                        <button key={idx} className="p-1.5 text-muted-foreground hover:bg-brand-secondary rounded">
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                    <button className="px-1.5 h-7 text-[13px] font-bold text-foreground hover:bg-brand-secondary rounded">
                        Aa
                    </button>
                </div>
            </div>

            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-brand-secondary rounded">
                <Layers className="w-4 h-4" />
                Position
            </button>
        </div>
    );
};

export default Toolbar;

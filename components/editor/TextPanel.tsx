"use client";

import React, { useCallback, useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import {
    type TextTemplate,
} from "@/lib/data/textTemplates";
import { addTextFromTemplate } from "@/lib/adapters/canvasHelpers";
import { loadGoogleFont, getFontByFamily } from "@/lib/data/fonts";
import { TemplateStorage } from "@/lib/utils/templateStorage";

const TextPanel: React.FC = () => {
    const { canvas, setActiveSidebarPanel } = useEditorStore();
    const [templates, setTemplates] = useState<TextTemplate[]>([]);

    useEffect(() => {
        setTemplates(TemplateStorage.getTemplates());
    }, []);

    const quickTemplates = templates.filter(t => t.category === "quick");
    const styledTemplates = templates.filter(t => t.category === "styled");

    /**
     * Adds text from a template to the canvas.
     * Loads the font first if it's a Google font.
     */
    const handleAddText = useCallback(
        async (template: TextTemplate) => {
            if (!canvas) return;
            await addTextFromTemplate(canvas, template);
        },
        [canvas]
    );

    return (
        <div className="w-full md:w-[280px] md:h-full h-[400px] max-h-[80vh] bg-neutral-50 border-r md:border-r border-t md:border-t-0 border-border-color flex flex-col shrink-0 animate-in overflow-hidden rounded-t-xl md:rounded-none shadow-lg md:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-primary">Text</span>
                    <span className="text-sm text-muted-text cursor-pointer hover:text-foreground transition-colors">
                        My Fonts
                    </span>
                </div>
                <button
                    onClick={() => setActiveSidebarPanel(null)}
                    className="p-1 text-muted-text hover:text-foreground hover:bg-brand-secondary rounded-lg transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
                {/* Quick Add Section */}
                <div className="space-y-2 mb-6">
                    {quickTemplates.map((template) => (
                        <QuickTextButton
                            key={template.id}
                            template={template}
                            onClick={() => handleAddText(template)}
                        />
                    ))}
                </div>

                {/* Styled Templates Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                    {styledTemplates.map((template) => (
                        <StyledTextCard
                            key={template.id}
                            template={template}
                            onClick={() => handleAddText(template)}
                        />
                    ))}
                </div>

                {/* Manage Templates Link */}
                <div className="mt-4 pt-3 border-t border-border-color">
                    <a
                        href="/editor/templates"
                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted-text
              hover:text-brand-primary hover:bg-brand-secondary rounded-lg transition-all w-full"
                    >
                        <Plus className="w-4 h-4" />
                        Manage Text Templates
                    </a>
                </div>
            </div>
        </div>
    );
};

// ── Quick Add Button ──
const QuickTextButton: React.FC<{
    template: TextTemplate;
    onClick: () => void;
}> = ({ template, onClick }) => {
    const sizeMap: Record<string, string> = {
        quick_header: "text-2xl font-bold",
        quick_subheader: "text-lg font-semibold",
        quick_body: "text-sm",
    };

    return (
        <button
            onClick={onClick}
            className="w-full text-center py-3 px-4 rounded-xl border border-border-color
        hover:border-brand-primary/30 hover:bg-brand-primary/5
        transition-all duration-200 group"
        >
            <span
                className={`text-foreground group-hover:text-brand-primary transition-colors ${sizeMap[template.id] || "text-base"
                    }`}
            >
                {template.name === "Header"
                    ? "Add a heading"
                    : template.name === "Sub Header"
                        ? "Add a sub heading"
                        : "Add body text"}
            </span>
        </button>
    );
};

// ── Styled Template Card ──
const StyledTextCard: React.FC<{
    template: TextTemplate;
    onClick: () => void;
}> = ({ template, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
        aspect-[4/3] rounded-xl overflow-hidden relative group
        bg-white dark:bg-slate-800
        border border-border-color
        hover:scale-[1.03] hover:shadow-lg hover:border-brand-primary/30
        transition-all duration-200 cursor-pointer
      `}
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2.5">
                {/* Preview text - supports multiline */}
                <span
                    className="leading-tight text-center w-full px-2"
                    style={{
                        fontFamily: template.style.fontFamily + ", sans-serif",
                        fontSize: Math.min(template.style.fontSize * 0.28, 16),
                        fontWeight: template.style.fontWeight as unknown as number,
                        fontStyle: template.style.fontStyle,
                        color: template.style.fill,
                        letterSpacing: Math.min(template.style.letterSpacing * 0.3, 2),
                        lineHeight: template.style.lineHeight,
                        whiteSpace: "pre-line",
                        maxHeight: "100%",
                        overflow: "hidden",
                        textAlign: template.style.align === "center" ? "center" : template.style.align === "right" ? "right" : "left",
                    }}
                >
                    {template.preview}
                </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 transition-colors duration-200 rounded-xl" />
        </button>
    );
};

export default TextPanel;

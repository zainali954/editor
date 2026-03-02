"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import {
    EDITOR_FONTS,
    getFontsByCategory,
    CATEGORY_LABELS,
    loadGoogleFont,
    type EditorFont,
} from "@/lib/data/fonts";
import {
    changeSelectedTextFont,
    getSelectedTextFont,
} from "@/lib/adapters/canvasHelpers";

const FontSelector: React.FC = () => {
    const { canvas, selectedObjectId } = useEditorStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loadingFont, setLoadingFont] = useState<string | null>(null);
    const [currentFont, setCurrentFont] = useState<string>("Inter");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update current font when selection changes
    useEffect(() => {
        if (!canvas) return;
        const font = getSelectedTextFont(canvas);
        if (font) {
            setCurrentFont(font);
        }
    }, [canvas, selectedObjectId]);

    // Also listen to canvas selection events for real-time updates
    useEffect(() => {
        if (!canvas) return;

        const updateFont = () => {
            const font = getSelectedTextFont(canvas);
            if (font) setCurrentFont(font);
        };

        const events = ["selection:created", "selection:updated", "object:modified"];
        events.forEach(ev => canvas.on(ev as any, updateFont));

        return () => {
            events.forEach(ev => canvas.off(ev as any, updateFont));
        };
    }, [canvas]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    /**
     * Handle font selection — load if needed, then apply.
     */
    const handleSelectFont = useCallback(
        async (font: EditorFont) => {
            if (!canvas) return;

            setLoadingFont(font.family);

            try {
                // Load the font via Google Fonts CSS
                await loadGoogleFont(font);

                // Apply to selected text object
                const applied = await changeSelectedTextFont(canvas, font.family);
                if (applied) {
                    setCurrentFont(font.family);
                }
            } catch (err) {
                console.error("[FontSelector] Failed to load font:", err);
            } finally {
                setLoadingFont(null);
                setIsOpen(false);
            }
        },
        [canvas]
    );

    // Group fonts by category
    const grouped = getCategorizedFonts(EDITOR_FONTS);
    
    // Debug: log to see if fonts are loaded
    console.log('FontSelector - Fonts grouped:', Object.keys(grouped), 'Total fonts:', EDITOR_FONTS.length);

    // Truncate display name
    const displayName =
        currentFont.length > 14 ? currentFont.slice(0, 14) + "..." : currentFont;

    return (
        <div className="relative inline-block z-50" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-[13px] text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800
          hover:bg-gray-100 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-all
          border border-gray-300 dark:border-gray-600
          min-w-[130px] max-w-[160px] h-7"
            >
                <span className="truncate flex-1 text-left" style={{ fontFamily: currentFont }}>
                    {displayName}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-1.5 w-[280px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900
            border-2 border-blue-500 rounded-xl shadow-2xl
            z-[200] overflow-hidden"
                    style={{ minHeight: '200px' }}
                >
                    {/* Font List */}
                    <div className="max-h-[400px] overflow-y-auto py-2">
                        {Object.entries(grouped).length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-600">
                                No fonts available
                            </div>
                        ) : (
                            Object.entries(grouped).map(([category, fonts]) => (
                                <div key={category}>
                                    {/* Category header */}
                                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                        {CATEGORY_LABELS[category] || category}
                                    </div>

                                    {/* Font items */}
                                    {fonts.map((font) => (
                                        <FontItem
                                            key={font.family}
                                            font={font}
                                            isSelected={currentFont === font.family}
                                            isLoading={loadingFont === font.family}
                                            onSelect={handleSelectFont}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Individual Font Item ──
const FontItem: React.FC<{
    font: EditorFont;
    isSelected: boolean;
    isLoading: boolean;
    onSelect: (font: EditorFont) => void;
}> = ({ font, isSelected, isLoading, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Preload font on hover for instant preview
    useEffect(() => {
        if (isHovered) {
            loadGoogleFont(font);
        }
    }, [isHovered, font]);

    return (
        <button
            onClick={() => onSelect(font)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
        w-full flex items-center gap-2.5 px-4 py-3 text-left
        transition-all duration-150 group border-b border-gray-100 dark:border-gray-800
        ${isSelected
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                }
      `}
        >
            {/* Font preview */}
            <span
                className="flex-1 text-[15px] truncate font-medium"
                style={{
                    fontFamily: isHovered || isSelected
                        ? `"${font.family}", ${font.category}`
                        : `${font.category}`,
                }}
            >
                {font.family}
            </span>

            {/* Status indicator */}
            <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                ) : isSelected ? (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : null}
            </div>
        </button>
    );
};

// ── Helper ──
function getCategorizedFonts(fonts: EditorFont[]): Record<string, EditorFont[]> {
    const grouped: Record<string, EditorFont[]> = {};
    for (const font of fonts) {
        if (!grouped[font.category]) {
            grouped[font.category] = [];
        }
        grouped[font.category].push(font);
    }
    return grouped;
}

export default FontSelector;

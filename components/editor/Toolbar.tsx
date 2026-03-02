"use client";

import React, { useState, useEffect } from "react";
import {
    Undo2, Redo2, ChevronDown, ChevronUp, Bold, Italic,
    Underline, Strikethrough, List, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from "lucide-react";
import FontSelector from "@/components/editor/FontSelector";
import ColorPicker from "@/components/editor/ColorPicker";
import { useEditorStore } from "@/lib/store/editorStore";
import {
    changeSelectedTextFontSize,
    getSelectedTextFontSize,
    getSelectedTextProperties,
    changeSelectedTextProperty
} from "@/lib/adapters/canvasHelpers";

const Toolbar: React.FC = () => {
    const { canvas, selectedObjectId } = useEditorStore();
    const [fontSize, setFontSize] = useState<number>(32);
    const [fontFamily, setFontFamily] = useState<string>("Inter");
    const [fontWeight, setFontWeight] = useState<string>("normal");
    const [fontStyle, setFontStyle] = useState<string>("normal");
    const [underline, setUnderline] = useState<boolean>(false);
    const [linethrough, setLinethrough] = useState<boolean>(false);
    const [isUppercase, setIsUppercase] = useState<boolean>(false);
    const [hasBullets, setHasBullets] = useState<boolean>(false);
    const [fill, setFill] = useState<string>("#000000");
    const [textAlign, setTextAlign] = useState<string>("left");

    // Sync properties with selection and cursor position
    useEffect(() => {
        if (!canvas) return;

        const syncStyles = () => {
            const activeObject = canvas.getActiveObject() as any;
            if (!activeObject || !(activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text')) {
                return;
            }

            // Get styles at current cursor position for accurate toolbar state
            const cursorPos = activeObject.selectionStart || 0;
            const styleAtCursor = activeObject.getSelectionStyles(cursorPos, cursorPos + 1)[0] || {};

            // Use cursor-specific styles if available, otherwise fall back to object-level
            setFontSize(Math.round(styleAtCursor.fontSize || activeObject.fontSize || 16));
            setFontFamily(styleAtCursor.fontFamily || activeObject.fontFamily || "Inter");
            setFontWeight(String(styleAtCursor.fontWeight || activeObject.fontWeight || "normal"));
            setFontStyle(styleAtCursor.fontStyle || activeObject.fontStyle || "normal");
            setUnderline(!!(styleAtCursor.underline !== undefined ? styleAtCursor.underline : activeObject.underline));
            setLinethrough(!!(styleAtCursor.linethrough !== undefined ? styleAtCursor.linethrough : activeObject.linethrough));
            setFill(String(styleAtCursor.fill || activeObject.fill || "#000000"));

            // Text align is always at object level, not character level
            setTextAlign(activeObject.textAlign || "left");

            // Derive formatting states from text content and object data
            if (typeof activeObject.text === 'string') {
                const text = activeObject.text;

                // Check stored preferences first, then derive from content
                const storedTransform = activeObject.data?.textTransform;
                if (storedTransform === 'uppercase') {
                    setIsUppercase(true);
                } else if (storedTransform === 'none') {
                    setIsUppercase(false);
                } else {
                    // Derive from content
                    setIsUppercase(text === text.toUpperCase() && text !== text.toLowerCase());
                }

                // Check stored bullet preference first
                if (activeObject.data?.hasBullets !== undefined) {
                    setHasBullets(activeObject.data.hasBullets);
                } else {
                    // Derive from content
                    setHasBullets(text.split('\n').some((line: string) => line.trim().startsWith('•')));
                }
            }
        };

        const events = ["selection:created", "selection:updated", "object:modified", "text:changed", "text:selection:changed"];
        events.forEach(ev => canvas.on(ev as any, syncStyles));

        syncStyles();

        return () => {
            events.forEach(ev => canvas.off(ev as any, syncStyles));
        };
    }, [canvas, selectedObjectId]);

    const handleFontSizeChange = (newSize: number) => {
        if (!canvas || newSize <= 0) return;
        if (changeSelectedTextFontSize(canvas, newSize)) {
            setFontSize(newSize);
        }
    };

    const toggleBold = () => {
        if (!canvas) return;
        const toggle = fontWeight === "bold" ? "normal" : "bold";
        if (changeSelectedTextProperty(canvas, "fontWeight", toggle)) {
            setFontWeight(toggle);
        }
    };

    const toggleItalic = () => {
        if (!canvas) return;
        const toggle = fontStyle === "italic" ? "normal" : "italic";
        if (changeSelectedTextProperty(canvas, "fontStyle", toggle)) {
            setFontStyle(toggle);
        }
    };

    const toggleUnderline = () => {
        if (!canvas) return;
        const toggle = !underline;
        if (changeSelectedTextProperty(canvas, "underline", toggle)) {
            setUnderline(toggle);
        }
    };

    const toggleLinethrough = () => {
        if (!canvas) return;
        const toggle = !linethrough;
        if (changeSelectedTextProperty(canvas, "linethrough", toggle)) {
            setLinethrough(toggle);
        }
    };

    const toggleCase = () => {
        const activeObject = canvas?.getActiveObject() as any;
        if (!activeObject || typeof activeObject.text !== 'string') return;

        const newText = isUppercase ? activeObject.text.toLowerCase() : activeObject.text.toUpperCase();
        activeObject.set("text", newText);

        // Store the case preference in the object's data so it persists during editing
        if (!activeObject.data) activeObject.data = {};
        activeObject.data.textTransform = isUppercase ? 'none' : 'uppercase';

        canvas?.renderAll();
        setIsUppercase(!isUppercase);
    };

    const toggleBullets = () => {
        const activeObject = canvas?.getActiveObject() as any;
        if (!activeObject || typeof activeObject.text !== 'string') return;

        const lines = activeObject.text.split('\n');
        const isCurrentlyBullet = lines.every((line: string) => line.trim().startsWith('•') || line.trim() === '');

        let newLines;
        if (isCurrentlyBullet) {
            // Remove bullets
            newLines = lines.map((line: string) => line.trim().startsWith('•') ? line.replace('•', '').trimStart() : line);
            // Clear bullet preference
            if (activeObject.data) {
                delete activeObject.data.hasBullets;
            }
        } else {
            // Add bullets
            newLines = lines.map((line: string) => line.trim() !== '' && !line.trim().startsWith('•') ? `• ${line.trimStart()}` : line);
            // Store bullet preference
            if (!activeObject.data) activeObject.data = {};
            activeObject.data.hasBullets = true;
        }

        activeObject.set("text", newLines.join('\n'));
        canvas?.renderAll();
        setHasBullets(!isCurrentlyBullet);
    };

    const changeTextAlign = (align: string) => {
        if (!canvas) return;
        if (changeSelectedTextProperty(canvas, "textAlign", align)) {
            setTextAlign(align);
        }
    };

    return (
        <div className="h-10 min-h-[40px] bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-visible relative z-10">
            <div className="flex items-center min-w-max h-full px-4 gap-1 relative">
                <button className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                    <Undo2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                    <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />

                {/* Color Picker */}
                <ColorPicker color={fill} onChange={setFill} />

                {/* Font Selector - Professional Dropdown */}
                <FontSelector />

                {/* Font size control */}
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded h-7 ml-1 bg-white dark:bg-slate-800">
                    <input
                        type="text"
                        className="w-10 bg-transparent border-none text-gray-900 dark:text-gray-100 text-center text-xs outline-none"
                        value={fontSize}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) handleFontSizeChange(val);
                        }}
                    />
                    <div className="flex flex-col border-l border-gray-300 dark:border-gray-600">
                        <button
                            onClick={() => handleFontSizeChange(fontSize + 1)}
                            className="h-3.5 w-4 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronUp className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={() => handleFontSizeChange(Math.max(1, fontSize - 1))}
                            className="h-3.5 w-4 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-300 dark:border-gray-600"
                        >
                            <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />

                {/* Text formatting */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={toggleBold}
                        className={`p-1.5 rounded transition-colors ${fontWeight === "bold" ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={toggleItalic}
                        className={`p-1.5 rounded transition-colors ${fontStyle === "italic" ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={toggleUnderline}
                        className={`p-1.5 rounded transition-colors ${underline ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <button
                        onClick={toggleLinethrough}
                        className={`p-1.5 rounded transition-colors ${linethrough ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />

                {/* Text alignment */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => changeTextAlign("left")}
                        className={`p-1.5 rounded transition-colors ${textAlign === "left" ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => changeTextAlign("center")}
                        className={`p-1.5 rounded transition-colors ${textAlign === "center" ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => changeTextAlign("right")}
                        className={`p-1.5 rounded transition-colors ${textAlign === "right" ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => changeTextAlign("justify")}
                        className={`p-1.5 rounded transition-colors ${textAlign === "justify" ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        title="Justify"
                    >
                        <AlignJustify className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />

                {/* Bullets and case */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={toggleBullets}
                        className={`p-1.5 rounded transition-colors ${hasBullets ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={toggleCase}
                        className={`px-1.5 h-7 text-[13px] font-bold rounded transition-colors ${isUppercase ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                        Aa
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <Layers className="w-4 h-4" />
                        Position
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;

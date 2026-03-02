"use client";

import React, { useRef } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { changeSelectedTextProperty } from "@/lib/adapters/canvasHelpers";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const { canvas } = useEditorStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTriggerClick = () => {
        inputRef.current?.click();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        if (!canvas) return;

        // Apply to canvas immediately
        if (changeSelectedTextProperty(canvas, "fill", newColor)) {
            onChange(newColor);
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={handleTriggerClick}
                className="w-6 h-6 rounded-md border border-border-color shadow-sm transition-all hover:scale-110 active:scale-95 overflow-hidden group relative"
                style={{ backgroundColor: color || "#000000" }}
                title="Change Text Color"
            >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <input
                    ref={inputRef}
                    type="color"
                    value={color || "#000000"}
                    onChange={handleColorChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                />
            </button>
        </div>
    );
};

export default ColorPicker;

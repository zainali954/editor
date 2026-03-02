"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Copy, Trash2 } from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import { duplicateSelectedObject, deleteSelectedObject } from "@/lib/adapters/canvasHelpers";

interface Position {
    top: number;
    left: number;
    width: number;
    visible: boolean;
}

const SelectionToolbar: React.FC = () => {
    const { canvas, selectedObjectId } = useEditorStore();
    const [pos, setPos] = useState<Position>({ top: 0, left: 0, width: 0, visible: false });
    const toolbarRef = useRef<HTMLDivElement>(null);

    /**
     * Updates the toolbar position based on the active object's bounding box.
     */
    const updatePosition = useCallback(() => {
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (!activeObject || !selectedObjectId) {
            setPos((p) => ({ ...p, visible: false }));
            return;
        }

        // Get the object's bounding rect relative to the viewport
        // Canvas.calcViewportBoundaries() might be needed for zoom, 
        // but for simple cases getBoundingRect works.
        const rect = activeObject.getBoundingRect();

        // We need to account for canvas offset in the DOM
        const canvasEl = canvas.getElement()?.parentElement;
        if (!canvasEl) return;

        const containerRect = canvasEl.getBoundingClientRect();

        setPos({
            top: rect.top - 48, // 48px above the object
            left: rect.left + rect.width / 2, // Center horizontally
            width: rect.width,
            visible: true,
        });
    }, [canvas, selectedObjectId]);

    useEffect(() => {
        if (!canvas) return;

        const events = [
            "selection:created",
            "selection:updated",
            "selection:cleared",
            "object:moving",
            "object:scaling",
            "object:rotating",
        ];

        events.forEach(event => {
            canvas.on(event as any, updatePosition);
        });

        // Initial position
        updatePosition();

        return () => {
            events.forEach(event => {
                canvas.off(event as any, updatePosition);
            });
        };
    }, [canvas, updatePosition]);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) return;
        await duplicateSelectedObject(canvas);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) return;
        deleteSelectedObject(canvas);
    };

    if (!pos.visible || !selectedObjectId) return null;

    return (
        <div
            ref={toolbarRef}
            className="absolute z-50 pointer-events-auto animate-in"
            style={{
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                transform: "translateX(-50%)",
            }}
        >
            <div className="flex items-center gap-1 bg-background dark:bg-slate-900 border border-border-color p-1 rounded-lg shadow-xl premium-shadow">
                <button
                    onClick={handleCopy}
                    title="Duplicate"
                    className="p-1.5 text-muted-text hover:text-brand-primary hover:bg-brand-secondary/80 rounded-md transition-all flex items-center justify-center"
                >
                    <Copy className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border-color mx-0.5" />
                <button
                    onClick={handleDelete}
                    title="Delete"
                    className="p-1.5 text-muted-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-all flex items-center justify-center"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Little arrow pointing down */}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-background dark:bg-slate-900 border-r border-b border-border-color rotate-45 shadow-sm" />
        </div>
    );
};

export default SelectionToolbar;

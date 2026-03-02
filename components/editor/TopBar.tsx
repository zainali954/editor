"use client";

import React, { useCallback, useRef } from "react";
import { Menu, Upload, Download, FileJson } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEditorStore } from "@/lib/store/editorStore";
import { exportToEditorJSONString } from "@/lib/adapters/export";
import { validateEditorJSON } from "@/lib/adapters/import";
import type { EditorStoreJSON } from "@/lib/types/editor-schema";

const TopBar: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { canvas, originalJSON, isLoading } = useEditorStore();

    /**
     * Import: Open file picker → validate → load design
     */
    const handleImport = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const json = JSON.parse(text) as EditorStoreJSON;

                const error = validateEditorJSON(json);
                if (error) {
                    alert(`Invalid Editor JSON: ${error}`);
                    return;
                }

                // Call the design loader exposed by Canvas
                const loader = (window as unknown as Record<string, unknown>)
                    .__loadDesign as ((json: EditorStoreJSON) => Promise<void>) | undefined;
                if (loader) {
                    await loader(json);
                }
            } catch (err) {
                console.error("[TopBar] Import error:", err);
                alert("Failed to parse JSON file.");
            }

            // Reset input so same file can be re-imported
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        []
    );

    /**
     * Export: Canvas → Editor JSON → Download
     */
    const handleExport = useCallback(() => {
        if (!canvas || !originalJSON) {
            alert("No design loaded to export.");
            return;
        }

        const activePageIndex = useEditorStore.getState().activePageIndex;
        const jsonString = exportToEditorJSONString(
            canvas,
            originalJSON,
            activePageIndex
        );

        // Create and trigger download
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "design-export.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [canvas, originalJSON]);

    /**
     * Log exported JSON for developer inspection
     */
    const handleLogJSON = useCallback(() => {
        if (!canvas || !originalJSON) {
            console.log("[TopBar] No design loaded.");
            return;
        }
        const activePageIndex = useEditorStore.getState().activePageIndex;
        const jsonString = exportToEditorJSONString(
            canvas,
            originalJSON,
            activePageIndex
        );
        console.log("[Export] Editor JSON:\n", jsonString);
    }, [canvas, originalJSON]);

    return (
        <header className="h-12 bg-background border-b border-border-color shrink-0 overflow-x-auto overflow-y-hidden">
            <div className="flex items-center justify-between min-w-max h-full px-4">
                {/* Left section */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 font-bold text-base text-foreground shrink-0">
                        <div className="w-5 h-5 bg-[#6366f1] rounded-sm" />
                        <span>Editor</span>
                    </div>

                    <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        <Menu className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        className="bg-transparent border-none text-foreground font-medium text-sm outline-none w-[200px] shrink-0"
                        defaultValue="Design name"
                    />
                </div>

                {/* Right section — Import / Export / Dev Tools */}
                <div className="flex items-center gap-2 shrink-0 ml-4">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Import */}
                <button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-brand-secondary rounded-lg transition-all disabled:opacity-50"
                    title="Import Editor JSON"
                >
                    <Upload className="w-4 h-4" />
                    Import
                </button>

                {/* Export */}
                <button
                    onClick={handleExport}
                    disabled={isLoading || !originalJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-brand-secondary rounded-lg transition-all disabled:opacity-50"
                    title="Export Editor JSON"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>

                {/* Dev: Log JSON */}
                <button
                    onClick={handleLogJSON}
                    disabled={!originalJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-brand-secondary rounded-lg transition-all disabled:opacity-50"
                    title="Log exported JSON to console"
                >
                    <FileJson className="w-4 h-4" />
                    Log
                </button>

                <div className="w-px h-5 bg-border-color mx-1" />

                <a
                    href="#"
                    className="text-muted-foreground text-[13px] hover:text-foreground transition-colors"
                >
                    For developers
                </a>

                <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default TopBar;

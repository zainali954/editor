"use client";

import React from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import TextPanel from "@/components/editor/TextPanel";

/**
 * SidebarPanel — renders the active flyout panel next to the sidebar.
 * Only one panel can be active at a time.
 */
const SidebarPanel: React.FC = () => {
    const { activeSidebarPanel, setActiveSidebarPanel } = useEditorStore();

    if (!activeSidebarPanel) return null;

    return (
        <>
            {/* Mobile overlay backdrop */}
            <div 
                className="md:hidden fixed inset-0 bg-black/20 z-40"
                onClick={() => setActiveSidebarPanel(null)}
            />
            {/* Panel content */}
            <div className="md:relative fixed md:static bottom-0 left-0 right-0 z-50 md:z-auto">
                {activeSidebarPanel === "text" && <TextPanel />}

                {/* Future panels */}
                {activeSidebarPanel === "templates" && (
                    <PlaceholderPanel title="Templates" description="Coming soon — browse pre-made design templates." />
                )}
                {activeSidebarPanel === "photos" && (
                    <PlaceholderPanel title="Photos" description="Coming soon — search and add stock photos." />
                )}
                {activeSidebarPanel === "shapes" && (
                    <PlaceholderPanel title="Shapes" description="Coming soon — add shapes and graphics." />
                )}
            </div>
        </>
    );
};

// ── Placeholder for unbuilt panels ──
const PlaceholderPanel: React.FC<{ title: string; description: string }> = ({
    title,
    description,
}) => {
    const { setActiveSidebarPanel } = useEditorStore();

    return (
        <div className="w-full md:w-[280px] md:h-full h-[400px] max-h-[80vh] bg-neutral-50 border-r md:border-r border-t md:border-t-0 border-border-color flex flex-col shrink-0 animate-in overflow-hidden rounded-t-xl md:rounded-none shadow-lg md:shadow-none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-color shrink-0">
                <span className="text-sm font-semibold text-foreground">{title}</span>
                <button
                    onClick={() => setActiveSidebarPanel(null)}
                    className="p-1 text-muted-text hover:text-foreground hover:bg-brand-secondary rounded-lg transition-all"
                >
                    ✕
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-sm text-muted-text text-center">{description}</p>
            </div>
        </div>
    );
};

export default SidebarPanel;

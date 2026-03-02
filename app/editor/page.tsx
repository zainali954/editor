"use client";

import React from "react";
import TopBar from "@/components/editor/TopBar";
import Toolbar from "@/components/editor/Toolbar";
import Sidebar from "@/components/editor/Sidebar";
import SidebarPanel from "@/components/editor/SidebarPanel";
import Canvas from "@/components/editor/Canvas";
import CanvasControls from "@/components/editor/CanvasControls";
import { useEditorStore } from "@/lib/store/editorStore";

export default function EditorPage() {
    const { activeSidebarPanel } = useEditorStore();
    const isPanelOpen = activeSidebarPanel !== null;

    return (
        <div className="flex flex-col h-screen w-full bg-background overflow-hidden selection:bg-brand-primary/20">
            <TopBar />
            <Toolbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop: Sidebar on left (vertical) */}
                <div className="hidden md:block">
                    <Sidebar />
                </div>
                {/* Desktop: SidebarPanel next to Sidebar */}
                <div className="hidden md:block">
                    <SidebarPanel />
                </div>
                {/* Canvas area */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <Canvas />
                    <CanvasControls />
                </div>
            </div>
            {/* Mobile/Tablet: Bottom bar with Sidebar (horizontal) - hide when panel is open */}
            {!isPanelOpen && (
                <div className="md:hidden border-t border-border-color bg-background shrink-0 overflow-x-auto overflow-y-hidden h-auto">
                    <div className="flex items-stretch min-w-max">
                        <Sidebar />
                    </div>
                </div>
            )}
            {/* Mobile/Tablet: SidebarPanel as overlay above bottom bar */}
            <div className="md:hidden">
                <SidebarPanel />
            </div>
        </div>
    );
}

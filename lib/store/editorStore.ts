/**
 * Zustand editor store.
 *
 * STRICT RULES:
 * - Store may contain ONLY: canvas instance, selected object id, editor UI state
 * - Store must NOT duplicate design JSON
 * - The original JSON is stored as a ref for export, NOT as reactive state
 */

import { create } from "zustand";
import type { Canvas as FabricCanvas } from "fabric";
import type { EditorStoreJSON } from "@/lib/types/editor-schema";

/** Sidebar panel IDs */
export type SidebarPanel = "text" | "templates" | "photos" | "shapes" | null;

interface EditorState {
    // ── Canvas ──
    canvas: FabricCanvas | null;
    setCanvas: (canvas: FabricCanvas | null) => void;

    // ── Selection ──
    selectedObjectId: string | null;
    setSelectedObjectId: (id: string | null) => void;

    // ── UI Flags ──
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    activePageIndex: number;
    setActivePageIndex: (index: number) => void;

    // ── Sidebar Panel ──
    activeSidebarPanel: SidebarPanel;
    setActiveSidebarPanel: (panel: SidebarPanel) => void;
    toggleSidebarPanel: (panel: SidebarPanel) => void;

    // ── Original JSON reference (NOT reactive state — just a ref for export) ──
    originalJSON: EditorStoreJSON | null;
    setOriginalJSON: (json: EditorStoreJSON | null) => void;

    // ── Zoom ──
    zoom: number;
    panX: number;
    panY: number;
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    canvas: null,
    setCanvas: (canvas) => set({ canvas }),

    selectedObjectId: null,
    setSelectedObjectId: (id) => set({ selectedObjectId: id }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    activePageIndex: 0,
    setActivePageIndex: (index) => set({ activePageIndex: index }),

    activeSidebarPanel: null,
    setActiveSidebarPanel: (panel) => set({ activeSidebarPanel: panel }),
    toggleSidebarPanel: (panel) => {
        const current = get().activeSidebarPanel;
        set({ activeSidebarPanel: current === panel ? null : panel });
    },

    originalJSON: null,
    setOriginalJSON: (json) => set({ originalJSON: json }),

    zoom: 1,
    panX: 0,
    panY: 0,
    setZoom: (zoom) => {
        set({ zoom });
    },
    setPan: (x, y) => {
        set({ panX: x, panY: y });
    },
    zoomIn: () => {
        const currentZoom = get().zoom;
        const newZoom = Math.min(currentZoom * 1.2, 5); // Max 500%
        get().setZoom(newZoom);
    },
    zoomOut: () => {
        const currentZoom = get().zoom;
        const newZoom = Math.max(currentZoom / 1.2, 0.1); // Min 10%
        get().setZoom(newZoom);
    },
    resetZoom: () => {
        set({ zoom: 1, panX: 0, panY: 0 });
    },
}));

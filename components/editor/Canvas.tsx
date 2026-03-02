"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { loadAllFonts } from "@/lib/adapters/fonts";
import {
    pageChildrenToFabricObjects,
    validateEditorJSON,
    getPageBackground,
} from "@/lib/adapters/import";
import type { EditorStoreJSON } from "@/lib/types/editor-schema";
import * as fabric from "fabric";
import { Loader2 } from "lucide-react";

import SelectionToolbar from "@/components/editor/SelectionToolbar";

const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mainContainerRef = useRef<HTMLElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const isPanningRef = useRef(false);
    const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
    const [isPanning, setIsPanning] = React.useState(false);
    const [isCtrlHeld, setIsCtrlHeld] = React.useState(false);
    const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 560 });

    const {
        setCanvas,
        setSelectedObjectId,
        setIsLoading,
        setOriginalJSON,
        isLoading,
        activePageIndex,
        zoom,
        panX,
        panY,
        setZoom,
        setPan,
    } = useEditorStore();

    /**
     * Initialize the Fabric canvas on mount.
     */
    useEffect(() => {
        if (!canvasRef.current || fabricCanvasRef.current) return;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 560,
            backgroundColor: "#ffffff",
            selection: true,
            preserveObjectStacking: true,
        });
        setCanvasSize({ width: 800, height: 560 });

        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas);

        // Selection event handlers
        fabricCanvas.on("selection:created", (e) => {
            const selected = e.selected?.[0];
            const meta = selected?.data as { id: string } | undefined;
            setSelectedObjectId(meta?.id ?? null);
        });

        fabricCanvas.on("selection:updated", (e) => {
            const selected = e.selected?.[0];
            const meta = selected?.data as { id: string } | undefined;
            setSelectedObjectId(meta?.id ?? null);
        });

        fabricCanvas.on("selection:cleared", () => {
            setSelectedObjectId(null);
        });

        // Listen for cursor position changes to update toolbar
        fabricCanvas.on("text:selection:changed", () => {
            // This will trigger toolbar to re-sync styles at cursor position
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
                fabricCanvas.fire("object:modified", { target: activeObject });
            }
        });

        // Handle text editing to preserve formatting for new characters
        let isProcessingChange = false;
        let previousText = '';
        
        // Store the last known cursor position
        let lastCursorPos = 0;
        
        fabricCanvas.on("text:changed", (e) => {
            const target = e.target as any;
            if (!target || !(target.type === 'textbox' || target.type === 'i-text')) return;
            
            // Prevent recursive calls
            if (isProcessingChange) {
                return;
            }

            const text = target.text || '';
            const cursor = target.selectionStart || 0;

            // Handle text transformation (uppercase) if set
            if (target.data?.textTransform === 'uppercase') {
                const upperText = text.toUpperCase();
                if (upperText !== text) {
                    isProcessingChange = true;
                    target.set("text", upperText);
                    target.selectionStart = target.selectionEnd = cursor;
                    fabricCanvas.renderAll();
                    previousText = upperText;
                    isProcessingChange = false;
                    return;
                }
            }

            // Auto-bullet logic on Enter - only if bullets are enabled
            if (target.data?.hasBullets && cursor > 0 && text[cursor - 1] === '\n') {
                const lines = text.split('\n');
                const currentLineIndex = text.slice(0, cursor).split('\n').length - 1;
                const previousLine = lines[currentLineIndex - 1] || '';

                // If the previous line had a bullet
                if (previousLine.trim().startsWith('•')) {
                    // Check if we just pressed enter on an empty bullet line (double enter to exit bullets)
                    if (previousLine.trim() === '•') {
                        // Remove the empty bullet line
                        const linesArray = text.split('\n');
                        linesArray[currentLineIndex - 1] = '';
                        isProcessingChange = true;
                        const newText = linesArray.join('\n');
                        target.set("text", newText);
                        target.selectionStart = target.selectionEnd = cursor - 2;
                        fabricCanvas.renderAll();
                        previousText = newText;
                        isProcessingChange = false;
                        return;
                    }

                    // Add bullet to new line
                    const head = text.slice(0, cursor);
                    const tail = text.slice(cursor);
                    const newText = head + '• ' + tail;
                    isProcessingChange = true;
                    target.set("text", newText);
                    target.selectionStart = target.selectionEnd = cursor + 2;
                    fabricCanvas.renderAll();
                    previousText = newText;
                    lastCursorPos = cursor + 2;
                    isProcessingChange = false;
                    return;
                }
            }

            // Store current state
            previousText = text;
            lastCursorPos = cursor;
        });

        // Use a separate event to apply styles - this prevents interference with text changes
        fabricCanvas.on("text:editing:entered", (e) => {
            const target = e.target as any;
            if (!target) return;
            
            // Set up default text style for this editing session
            const defaultStyles = {
                fontWeight: target.fontWeight,
                fontStyle: target.fontStyle,
                underline: target.underline,
                linethrough: target.linethrough,
                fill: target.fill,
                fontSize: target.fontSize,
                fontFamily: target.fontFamily,
            };
            
            // Store these as the default for new characters
            target._defaultTextStyle = defaultStyles;
        });

        // Apply styles after each keystroke using a different approach
        let styleTimeout: NodeJS.Timeout | null = null;
        fabricCanvas.on("text:changed", (e) => {
            const target = e.target as any;
            if (!target || isProcessingChange) return;

            // Clear any pending style application
            if (styleTimeout) {
                clearTimeout(styleTimeout);
            }

            // Apply styles with a tiny delay to avoid interfering with text insertion
            styleTimeout = setTimeout(() => {
                if (!target._defaultTextStyle) return;

                const cursor = target.selectionStart || 0;
                const text = target.text || '';
                
                // Only apply if we're still in editing mode and cursor is valid
                if (cursor > 0 && cursor <= text.length) {
                    // Apply style only to the character just before cursor
                    try {
                        target.setSelectionStyles(target._defaultTextStyle, cursor - 1, cursor);
                        fabricCanvas.renderAll();
                    } catch (err) {
                        // Ignore errors from style application
                    }
                }
            }, 0);
        });

        // Initialize with an empty design shell so Export/Log are enabled from the start
        setOriginalJSON({
            width: 800,
            height: 560,
            fonts: [],
            pages: [
                {
                    id: "page_1",
                    width: 800,
                    height: 560,
                    background: "#ffffff",
                    children: []
                }
            ]
        });

        // Auto-load sample design (disabled for empty start)
        // loadDesignFromURL("/sample-design.json");

        return () => {
            fabricCanvas.dispose();
            fabricCanvasRef.current = null;
            setCanvas(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Keep Fabric.js canvas at 1:1 zoom (content stays same size)
     * Zoom is applied via CSS transform on the container div
     */
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Always keep Fabric.js canvas at 1.0 zoom
        canvas.setZoom(1);
        canvas.renderAll();
    }, []);

    /**
     * Setup zoom and pan event handlers
     */
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        const mainContainer = mainContainerRef.current;
        if (!canvas || !mainContainer) return;

        // Mouse wheel zoom (with Ctrl key) - zooms the white canvas container
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                e.stopPropagation();

                const delta = e.deltaY;
                const zoomFactor = delta > 0 ? 0.9 : 1.1;
                const currentZoom = zoom;
                const newZoom = Math.max(0.1, Math.min(5, currentZoom * zoomFactor));

                // Zoom towards mouse position
                const container = containerRef.current;
                if (!container) return;
                
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Calculate mouse position relative to container center
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                
                // Adjust pan to zoom towards mouse position
                const newPanX = panX - (mouseX * (newZoom - currentZoom)) / currentZoom;
                const newPanY = panY - (mouseY * (newZoom - currentZoom)) / currentZoom;
                
                setZoom(newZoom);
                setPan(newPanX, newPanY);
            }
        };

        // Track Ctrl key state for cursor
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                setIsCtrlHeld(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.ctrlKey && !e.metaKey) {
                setIsCtrlHeld(false);
                // Stop panning if Ctrl is released
                if (isPanningRef.current) {
                    isPanningRef.current = false;
                    setIsPanning(false);
                    lastPanPointRef.current = null;
                }
            }
        };

        // Mouse down for panning (with Ctrl key) - pans the white canvas container
        const handleMouseDown = (e: MouseEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.button === 0) {
                isPanningRef.current = true;
                setIsPanning(true);
                // Store screen coordinates and current pan position
                lastPanPointRef.current = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        };

        // Mouse move for panning - moves the white canvas container
        const handleMouseMove = (e: MouseEvent) => {
            if (isPanningRef.current && lastPanPointRef.current) {
                const deltaX = e.clientX - lastPanPointRef.current.x;
                const deltaY = e.clientY - lastPanPointRef.current.y;
                
                // Update pan position
                setPan(panX + deltaX, panY + deltaY);
                
                lastPanPointRef.current = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        };

        // Mouse up to stop panning
        const handleMouseUp = () => {
            if (isPanningRef.current) {
                isPanningRef.current = false;
                setIsPanning(false);
                lastPanPointRef.current = null;
            }
        };

        // Add event listeners to main container (gray background area)
        mainContainer.addEventListener('wheel', handleWheel, { passive: false });
        mainContainer.addEventListener('mousedown', handleMouseDown);
        mainContainer.addEventListener('mousemove', handleMouseMove);
        mainContainer.addEventListener('mouseup', handleMouseUp);
        mainContainer.addEventListener('mouseleave', handleMouseUp); // Stop panning if mouse leaves
        
        // Add keyboard listeners for Ctrl key tracking
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            mainContainer.removeEventListener('wheel', handleWheel);
            mainContainer.removeEventListener('mousedown', handleMouseDown);
            mainContainer.removeEventListener('mousemove', handleMouseMove);
            mainContainer.removeEventListener('mouseup', handleMouseUp);
            mainContainer.removeEventListener('mouseleave', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [zoom, panX, panY, setZoom, setPan]);

    /**
     * Loads a Editor JSON design from a URL.
     * Follows the STRICT IMPORT PIPELINE:
     * 1. Validate JSON
     * 2. Load fonts
     * 3. Map nodes → Fabric objects
     * 4. Attach metadata
     * 5. Render canvas
     */
    const loadDesignFromURL = useCallback(
        async (url: string) => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return;

            setIsLoading(true);

            try {
                // 1. Fetch and validate
                const response = await fetch(url);
                const json: EditorStoreJSON = await response.json();

                const error = validateEditorJSON(json);
                if (error) {
                    console.error("[Canvas] Invalid JSON:", error);
                    setIsLoading(false);
                    return;
                }

                await loadDesign(json);
            } catch (err) {
                console.error("[Canvas] Failed to load design:", err);
                setIsLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    /**
     * Core design loading logic — separated for reuse (file upload, etc.)
     */
    const loadDesign = useCallback(
        async (json: EditorStoreJSON) => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return;

            setIsLoading(true);

            try {
                // Store original JSON as reference for export
                setOriginalJSON(json);

                const page = json.pages[activePageIndex];
                if (!page) {
                    console.error("[Canvas] No page found at index", activePageIndex);
                    setIsLoading(false);
                    return;
                }

                // 2. Load fonts (BLOCK rendering until done)
                if (json.fonts && json.fonts.length > 0) {
                    const fontResults = await loadAllFonts(json.fonts, canvas);
                    fontResults.forEach((loaded, family) => {
                        if (!loaded) {
                            console.warn(`[Canvas] Font "${family}" failed to load`);
                        }
                    });
                }

                // 3. Clear existing objects
                canvas.clear();

                // Set canvas dimensions and background from page
                const canvasWidth = page.width || json.width || 800;
                const canvasHeight = page.height || json.height || 560;
                canvas.setDimensions({
                    width: canvasWidth,
                    height: canvasHeight,
                });
                canvas.backgroundColor = getPageBackground(page);
                setCanvasSize({ width: canvasWidth, height: canvasHeight });

                // 4. Map nodes → Fabric objects (metadata attached inside adapter)
                const fabricObjects = await pageChildrenToFabricObjects(page.children);

                // 5. Add to canvas and render
                for (const obj of fabricObjects) {
                    canvas.add(obj);
                }

                canvas.renderAll();
            } catch (err) {
                console.error("[Canvas] Error loading design:", err);
            } finally {
                setIsLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activePageIndex]
    );

    // Expose loadDesign to the global store so TopBar can trigger file imports
    useEffect(() => {
        (window as unknown as Record<string, unknown>).__loadDesign = loadDesign;
        return () => {
            delete (window as unknown as Record<string, unknown>).__loadDesign;
        };
    }, [loadDesign]);

    // Calculate responsive scale for mobile viewports
    const [viewportScale, setViewportScale] = React.useState(1);
    
    React.useEffect(() => {
        const updateViewportScale = () => {
            if (typeof window === 'undefined') return;
            const isMobile = window.innerWidth < 768; // md breakpoint
            if (isMobile) {
                // Scale canvas to fit mobile viewport better, but keep actual size same
                const maxWidth = window.innerWidth - 40; // Account for padding
                const maxHeight = window.innerHeight - 200; // Account for top bars and bottom bar
                const scaleX = maxWidth / canvasSize.width;
                const scaleY = maxHeight / canvasSize.height;
                const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
                setViewportScale(scale);
            } else {
                setViewportScale(1);
            }
        };
        
        updateViewportScale();
        window.addEventListener('resize', updateViewportScale);
        return () => window.removeEventListener('resize', updateViewportScale);
    }, [canvasSize.width, canvasSize.height]);
    
    // Calculate the scaled size for scrollbar calculation (combine zoom and viewport scale)
    const effectiveZoom = zoom * viewportScale;
    const scaledWidth = canvasSize.width * effectiveZoom;
    const scaledHeight = canvasSize.height * effectiveZoom;

    // Determine cursor style based on Ctrl key and panning state
    const getCursorStyle = () => {
        if (isPanning) {
            return 'grabbing';
        }
        if (isCtrlHeld) {
            return 'grab';
        }
        return 'default';
    };

    return (
        <main 
            ref={mainContainerRef}
            className="flex-1 bg-neutral-200 relative overflow-auto transition-colors"
            style={{ cursor: getCursorStyle() }}
        >
            {/* Wrapper that accounts for zoom to enable scrollbars */}
            <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{
                    minWidth: `${scaledWidth + 200}px`, // Add padding for panning
                    minHeight: `${scaledHeight + 200}px`, // Add padding for panning
                }}
            >
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-sm">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                            <span className="text-sm font-medium text-muted-text">
                                Loading design...
                            </span>
                        </div>
                    </div>
                )}

                {/* Selection Floating Toolbar */}
                <SelectionToolbar />

                {/* Fabric Canvas wrapper - this white container is zoomed/panned */}
                <div
                    ref={containerRef}
                    className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-sm relative bg-white"
                    style={{ 
                        touchAction: 'none',
                        transform: `translate(${panX}px, ${panY}px) scale(${effectiveZoom})`,
                        transformOrigin: 'center center',
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                    }}
                >
                    <canvas ref={canvasRef} id="fabric-canvas" />
                </div>
            </div>
        </main>
    );
};

export default Canvas;

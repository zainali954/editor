/**
 * Export adapter: Fabric.js canvas → Editor JSON.
 *
 * STRICT RULES:
 * - Iterate canvas objects, read stored metadata (object.data)
 * - Rebuild nodes preserving ALL original keys
 * - Preserve order
 * - Match original structure exactly
 * - Export MUST NOT depend on UI state or DOM
 */

import * as fabric from "fabric";
import type {
    EditorStoreJSON,
    EditorPage,
    EditorElement,
    EditorTextElement,
    EditorImageElement,
} from "@/lib/types/editor-schema";
import { getFontByFamily } from "@/lib/data/fonts";

/**
 * Normalizes font family names (strips quotes) for registry lookups.
 */
function normalizeFontFamily(name: string): string {
    if (!name) return "";
    return name.replace(/['"]/g, "").trim();
}

/**
 * Extracts a single Fabric object back to a Editor element.
 * Merges canvas-modified props over the original element data.
 */
function fabricObjectToElement(
    obj: fabric.FabricObject,
    originalElement: EditorElement | undefined
): EditorElement | null {
    const meta = obj.data as { id: string; type: string } | undefined;
    if (!meta || !meta.id || !meta.type) {
        console.warn("[export] Object missing metadata, skipping:", obj);
        return null;
    }

    // Start from original element (preserves ALL unknown keys)
    const base: Record<string, unknown> = originalElement
        ? { ...originalElement }
        : { id: meta.id, type: meta.type };

    // Update position/transform from canvas
    // Ensure we export the top-left corner (x, y) even if Fabric uses center origin
    const width = obj.width * obj.scaleX;
    const height = obj.height * obj.scaleY;

    let x = obj.left;
    let y = obj.top;

    if (obj.originX === "center") x -= width / 2;
    if (obj.originY === "center") y -= height / 2;

    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
    base.rotation = obj.angle ?? base.rotation;
    base.opacity = obj.opacity ?? base.opacity;
    base.visible = obj.visible ?? base.visible;

    // Interactivity
    base.selectable = obj.selectable ?? base.selectable;
    base.locked = obj.lockMovementX === true;

    // Ensure we don't carry over temporary fabric properties that might bloat JSON
    delete base.oCoords;
    delete base.ownMatrixCache;

    if (meta.type === "text") {
        const textObj = obj as fabric.Textbox;
        base.width = textObj.width ?? base.width;

        // Typography
        base.fontSize = textObj.fontSize ?? (base as EditorTextElement).fontSize;
        const rawFont = textObj.fontFamily || (base as EditorTextElement).fontFamily;
        base.fontFamily = normalizeFontFamily(rawFont);

        base.fontWeight = String(textObj.fontWeight ?? (base as EditorTextElement).fontWeight);
        base.fontStyle = textObj.fontStyle ?? (base as EditorTextElement).fontStyle;
        base.fill = (textObj.fill as string) ?? (base as EditorTextElement).fill;
        base.align = textObj.textAlign ?? (base as EditorTextElement).align;
        base.lineHeight = textObj.lineHeight ?? (base as EditorTextElement).lineHeight;
        base.letterSpacing = (textObj.charSpacing ?? 0) / 10;

        // Decorations
        base.textDecoration = textObj.underline ? "underline" : (textObj.linethrough ? "line-through" : "");

        // Stroke - Explicitly avoid default 1px strokes if not purposely set
        if (textObj.stroke && textObj.strokeWidth && textObj.strokeWidth > 0 && textObj.stroke !== "transparent") {
            base.stroke = textObj.stroke as string;
            base.strokeWidth = textObj.strokeWidth;
        } else {
            base.stroke = null;
            base.strokeWidth = 0;
        }

        // Content
        const rawText = textObj.text || "";
        base.text = rawText;
    }

    // Shadow (shared by text and image)
    if (obj.shadow && obj.shadow instanceof fabric.Shadow) {
        base.shadowEnabled = true;
        base.shadowBlur = obj.shadow.blur;
        base.shadowOffsetX = obj.shadow.offsetX;
        base.shadowOffsetY = obj.shadow.offsetY;
        base.shadowColor = obj.shadow.color;
    } else {
        base.shadowEnabled = false;
    }

    if (meta.type === "image") {
        const imgObj = obj as fabric.FabricImage;
        base.width = (imgObj.width ?? 0) * (imgObj.scaleX ?? 1);
        base.height = (imgObj.height ?? 0) * (imgObj.scaleY ?? 1);
        base.flipX = imgObj.flipX ?? false;
        base.flipY = imgObj.flipY ?? false;

        // Handle image source (crucial for new images)
        if (imgObj.getElement() instanceof HTMLImageElement) {
            base.src = (imgObj.getElement() as HTMLImageElement).src;
        } else if (!base.src && (obj.data as any).src) {
            base.src = (obj.data as any).src;
        }
    }

    return base as EditorElement;
}

/**
 * Exports the current Fabric canvas state back to Editor JSON format.
 * 
 * Logic:
 * 1. Build a lookup of original children by ID (to preserve metadata).
 * 2. Iterate over ALL objects on the canvas.
 * 3. If an object is in the original list, update it.
 * 4. If it's a NEW object (e.g. from a template), create a fresh JSON node.
 * 5. If an object was in original but is NOT on canvas, it is discarded (DELETED).
 */
export function exportToEditorJSON(
    canvas: fabric.Canvas,
    originalJSON: EditorStoreJSON,
    activePageIndex: number = 0
): EditorStoreJSON {
    // Deep clone original to avoid mutation
    const output: EditorStoreJSON = JSON.parse(JSON.stringify(originalJSON));

    if (!output.pages || !output.pages[activePageIndex]) {
        return output;
    }

    const page: EditorPage = output.pages[activePageIndex];
    const canvasObjects = canvas.getObjects();

    // Lookup of original children to preserve hidden keys
    const originalChildrenMap = new Map<string, EditorElement>();
    for (const child of page.children) {
        if (child.id) originalChildrenMap.set(child.id, child);
    }

    const updatedChildren: EditorElement[] = [];

    // Iterate over active canvas objects to drive the export
    for (const obj of canvasObjects) {
        const meta = obj.data as { id: string; type: string } | undefined;
        if (!meta?.id) continue;

        const original = originalChildrenMap.get(meta.id);
        const node = fabricObjectToElement(obj, original);

        if (node) {
            updatedChildren.push(node);
        }
    }

    page.children = updatedChildren;

    // Collect and update fonts array (mandatory for re-import font loading)
    const usedFontFamilies = new Set<string>();
    updatedChildren.forEach(child => {
        if (child.type === "text") {
            const font = (child as EditorTextElement).fontFamily;
            if (font) usedFontFamilies.add(normalizeFontFamily(font));
        }
    });

    const existingFonts = new Map<string, any>();
    (originalJSON.fonts || []).forEach(f => {
        const norm = normalizeFontFamily(f.fontFamily);
        existingFonts.set(norm, { ...f, fontFamily: norm });
    });

    usedFontFamilies.forEach(family => {
        if (!existingFonts.has(family)) {
            const fontInfo = getFontByFamily(family);
            if (fontInfo) {
                existingFonts.set(family, {
                    fontFamily: family,
                    url: fontInfo.cssUrl,
                });
            }
        }
    });
    output.fonts = Array.from(existingFonts.values());

    return output;
}

/**
 * Convenience: Export to a JSON string with formatting.
 */
export function exportToEditorJSONString(
    canvas: fabric.Canvas,
    originalJSON: EditorStoreJSON,
    activePageIndex: number = 0
): string {
    const json = exportToEditorJSON(canvas, originalJSON, activePageIndex);
    return JSON.stringify(json, null, 2);
}

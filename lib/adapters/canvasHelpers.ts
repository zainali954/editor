/**
 * Canvas helpers — operations that modify the Fabric canvas.
 * These functions live in the adapters layer to keep conversion
 * logic isolated from UI components.
 */

import * as fabric from "fabric";
import type { TextTemplateStyle, TextTemplate } from "@/lib/data/textTemplates";
import { loadGoogleFont, getFontByFamily } from "@/lib/data/fonts";

/**
 * Adds a text element to the Fabric canvas using a template style.
 * Assigns a unique ID and attaches metadata.
 */
export const addTextFromTemplate = async (
    canvas: fabric.Canvas,
    template: TextTemplate
): Promise<fabric.Textbox> => {
    const { preview, style } = template;
    const id = `text_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Pre-load font if available in registry
    const fontInfo = getFontByFamily(style.fontFamily);
    if (fontInfo) {
        await loadGoogleFont(fontInfo);
    }

    const parsedWeight = parseFontWeight(style.fontWeight);

    // Determine width based on content - wider for multiline templates
    const isMultiline = preview.includes('\n');
    const defaultWidth = isMultiline ? 600 : 400;

    const textbox = new fabric.Textbox(preview, {
        left: 100,
        top: 100,
        width: defaultWidth,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: parsedWeight,
        fontStyle: style.fontStyle === "italic" ? "italic" : "normal",
        fill: style.fill || "#000000",
        textAlign: style.align as fabric.Textbox["textAlign"],
        lineHeight: style.lineHeight || 1.2,
        charSpacing: (style.letterSpacing || 0) * 10,
        underline: style.textDecoration === "underline",
        linethrough: style.textDecoration === "line-through",
        opacity: style.opacity ?? 1,
        // Top-left origin to match schema
        originX: "left",
        originY: "top",
        strokeUniform: true,
        // Metadata — mandatory
        data: {
            id,
            type: "text",
        },
    });

    // Center on the canvas manually while keeping left/top origin
    const canvasCenter = canvas.getCenterPoint();
    textbox.set({
        left: canvasCenter.x - (textbox.width * textbox.scaleX) / 2,
        top: canvasCenter.y - (textbox.height * textbox.scaleY) / 2,
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();

    return textbox;
}

/**
 * Changes the font family of the currently selected text object.
 * If no text object is selected, does nothing.
 */
export async function changeSelectedTextFont(
    canvas: fabric.Canvas,
    fontFamily: string
): Promise<boolean> {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return false;

    // Load first if in registry
    const fontInfo = getFontByFamily(fontFamily);
    if (fontInfo) {
        await loadGoogleFont(fontInfo);
    }

    // Only apply to text objects
    if (activeObj.type === "textbox" || activeObj.type === "i-text" || activeObj.type === "text") {
        const textObj = activeObj as fabric.Textbox;
        textObj.set("fontFamily", fontFamily);
        canvas.renderAll();
        return true;
    }

    return false;
}

/**
 * Gets the currently selected text object's font family.
 */
export function getSelectedTextFont(canvas: fabric.Canvas): string | null {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return null;

    if (activeObj.type === "textbox" || activeObj.type === "i-text" || activeObj.type === "text") {
        return (activeObj as fabric.Textbox).fontFamily || null;
    }

    return null;
}

/**
 * Duplicates the currently selected object.
 * Clones properties exactly but assigns a new unique ID.
 */
export async function duplicateSelectedObject(canvas: fabric.Canvas): Promise<fabric.FabricObject | null> {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return null;

    return new Promise((resolve) => {
        activeObj.clone().then((clonedObj) => {
            const id = `${activeObj.data?.type || 'obj'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

            canvas.discardActiveObject();
            clonedObj.set({
                left: (clonedObj.left || 0) + 20, // offset for visibility
                top: (clonedObj.top || 0) + 20,
                evented: true,
                data: {
                    ...(activeObj.data || {}),
                    id,
                },
            });

            if (clonedObj.type === 'activeSelection') {
                // Not perfectly supported in Phase 1 yet, but handle basic single object clone best
                canvas.add(clonedObj);
                canvas.setActiveObject(clonedObj);
            } else {
                canvas.add(clonedObj);
                canvas.setActiveObject(clonedObj);
            }

            canvas.requestRenderAll();
            resolve(clonedObj);
        });
    });
}

/**
 * Deletes the currently selected object.
 */
export function deleteSelectedObject(canvas: fabric.Canvas): boolean {
    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects.length) return false;

    activeObjects.forEach((obj) => {
        canvas.remove(obj);
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    return true;
}

/**
 * Changes the font size of the currently selected text object.
 */
export function changeSelectedTextFontSize(
    canvas: fabric.Canvas,
    fontSize: number
): boolean {
    return changeSelectedTextProperty(canvas, "fontSize", fontSize);
}

/**
 * Gets the currently selected text object's font size.
 */
export function getSelectedTextFontSize(canvas: fabric.Canvas): number | null {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return null;

    if (activeObj.type === "textbox" || activeObj.type === "i-text" || activeObj.type === "text") {
        return (activeObj as fabric.Textbox).fontSize || null;
    }

    return null;
}

/**
 * Gets all relevant text properties for the currently selected object.
 */
export function getSelectedTextProperties(canvas: fabric.Canvas) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Textbox)) {
        return null;
    }

    return {
        fontSize: activeObject.fontSize,
        fontFamily: activeObject.fontFamily,
        fontWeight: activeObject.fontWeight,
        fontStyle: activeObject.fontStyle,
        fill: activeObject.fill,
        textAlign: activeObject.textAlign,
        lineHeight: activeObject.lineHeight,
        charSpacing: activeObject.charSpacing,
        underline: activeObject.underline,
        linethrough: activeObject.linethrough,
    };
}

/**
 * Changes a specific property on the selected text object.
 * Also sets default text style so new typed characters inherit the formatting.
 */
export function changeSelectedTextProperty(canvas: fabric.Canvas, property: string, value: any) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return false;

    if (activeObject instanceof fabric.Textbox) {
        activeObject.set(property as any, value);
        
        // Set default text style for new characters typed in edit mode
        // This ensures formatting persists when typing
        const styleProps = ['fontWeight', 'fontStyle', 'underline', 'linethrough', 'fill', 'fontSize', 'fontFamily'];
        if (styleProps.includes(property)) {
            const currentStyles: any = {};
            styleProps.forEach(prop => {
                currentStyles[prop] = activeObject.get(prop as any);
            });
            // Apply to entire text to ensure consistency
            activeObject.setSelectionStyles(currentStyles, 0, activeObject.text?.length || 0);
        }
        
        canvas.renderAll();
        return true;
    }
    return false;
}

// ── Helpers ──

export function parseFontWeight(weight: string | number | undefined): string | number {
    if (!weight) return "normal";
    if (typeof weight === "number") return weight;
    const num = parseInt(weight, 10);
    if (!isNaN(num)) return num;
    return weight; // "bold", "normal", etc.
}

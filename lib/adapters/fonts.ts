/**
 * Font loading adapter.
 * Uses the FontFace API to load fonts BEFORE canvas rendering.
 * Missing fonts do NOT modify the source JSON.
 */

import * as fabric from "fabric";
import type { EditorFont } from "@/lib/types/editor-schema";
import { loadGoogleFont, getFontByFamily } from "@/lib/data/fonts";

/**
 * Loads a single font using the FontFace API or Google Fonts link injection.
 * Returns true if loaded, false on failure (failure is non-fatal).
 */
async function loadSingleFont(font: EditorFont): Promise<boolean> {
    if (!font.url) {
        // No URL → check if the font is already available in the system
        try {
            await document.fonts.load(`16px "${font.fontFamily}"`);
            return document.fonts.check(`16px "${font.fontFamily}"`);
        } catch {
            console.warn(`[fonts] No URL for "${font.fontFamily}", checking system availability.`);
            return false;
        }
    }

    // Special case: Google Fonts CSS URL
    if (font.url.includes("fonts.googleapis.com")) {
        try {
            const fontInfo = getFontByFamily(font.fontFamily);
            if (fontInfo) {
                return await loadGoogleFont(fontInfo);
            }
            // Fallback: If we don't have local info, try loading as-is
            return false;
        } catch (err) {
            console.warn(`[fonts] Failed to load Google Font "${font.fontFamily}"`, err);
            return false;
        }
    }

    try {
        const fontFace = new FontFace(font.fontFamily, `url(${font.url})`);
        const loaded = await fontFace.load();
        document.fonts.add(loaded);
        return true;
    } catch (err) {
        console.warn(`[fonts] Failed to load binary font "${font.fontFamily}" from ${font.url}:`, err);
        return false;
    }
}

/**
 * Loads all fonts defined in the Editor JSON.
 * Blocks until all font loads settle (succeed or fail).
 * Returns a map of fontFamily → loaded status.
 */
export async function loadAllFonts(
    fonts: EditorFont[],
    canvas?: fabric.Canvas
): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    if (!fonts || fonts.length === 0) return results;

    const promises = fonts.map(async (font) => {
        const ok = await loadSingleFont(font);
        results.set(font.fontFamily, ok);
    });

    await Promise.allSettled(promises);

    // Wait for the browser font engine to be ready
    try {
        await document.fonts.ready;
    } catch (e) {
        console.warn("[fonts] error waiting for document.fonts.ready", e);
    }

    // Force a re-render if canvas is provided
    if (canvas) {
        canvas.renderAll();
    }

    return results;
}

/**
 * Collects unique font families from page elements that need loading.
 * This extracts fonts directly referenced by text elements that may
 * not be listed in the top-level fonts array.
 */
export function extractFontFamiliesFromElements(
    elements: Array<{ type: string; fontFamily?: string }>
): string[] {
    const families = new Set<string>();
    for (const el of elements) {
        if (el.type === "text" && el.fontFamily) {
            families.add(el.fontFamily);
        }
    }
    return Array.from(families);
}

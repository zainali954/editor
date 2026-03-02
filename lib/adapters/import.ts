/**
 * Import adapter: Editor JSON → Fabric.js objects.
 *
 * STRICT RULES:
 * - Never mutate the original JSON
 * - Every Fabric object MUST have `data = { id, type }`
 * - Fonts must be loaded before this runs (caller responsibility)
 * - Images loaded asynchronously, original URLs preserved
 */

import * as fabric from "fabric";
import type {
    EditorElement,
    EditorTextElement,
    EditorImageElement,
    EditorPage,
} from "@/lib/types/editor-schema";

/**
 * Converts a single Editor text element to a Fabric.js Textbox.
 */
function textToFabric(node: EditorTextElement): fabric.FabricObject {
    // Strip HTML tags for plain text display (Editor stores styled HTML).
    const plainText = stripHtml(node.text);

    const textbox = new fabric.Textbox(plainText, {
        left: node.x,
        top: node.y,
        width: node.width,
        fontSize: node.fontSize,
        fontFamily: node.fontFamily,
        fontStyle: node.fontStyle === "italic" ? "italic" : "normal",
        fontWeight: parseFontWeight(node.fontWeight),
        fill: node.fill || "#000000",
        textAlign: (node.align as fabric.Textbox["textAlign"]) || "left",
        lineHeight: node.lineHeight || 1.2,
        charSpacing: (node.letterSpacing || 0) * 10, // Fabric uses different scale
        underline: node.textDecoration === "underline",
        linethrough: node.textDecoration === "line-through",
        opacity: node.opacity ?? 1,
        angle: node.rotation || 0,
        visible: node.visible !== false,
        selectable: node.selectable !== false,
        lockMovementX: node.locked === true,
        lockMovementY: node.locked === true,
        // Top-left origin to match schema/exported coords
        originX: "left",
        originY: "top",
        strokeUniform: true,
        // Metadata — mandatory
        data: {
            id: node.id,
            type: node.type,
        },
    });

    // Apply shadow if enabled
    if (node.shadowEnabled) {
        textbox.shadow = new fabric.Shadow({
            color: node.shadowColor || "rgba(0,0,0,0.5)",
            blur: node.shadowBlur || 0,
            offsetX: node.shadowOffsetX || 0,
            offsetY: node.shadowOffsetY || 0,
        });
    }

    // Apply stroke only if valid
    if (node.stroke && node.strokeWidth && node.strokeWidth > 0) {
        textbox.set("stroke", node.stroke);
        textbox.set("strokeWidth", node.strokeWidth);
    } else {
        textbox.set("stroke", null);
        textbox.set("strokeWidth", 0);
    }

    return textbox;
}

/**
 * Converts a Editor image element to a Fabric.js Image.
 * Returns a Promise because image loading is asynchronous.
 * Original URL is preserved — NO base64 conversion.
 */
async function imageToFabric(
    node: EditorImageElement
): Promise<fabric.FabricObject> {
    return new Promise<fabric.FabricObject>((resolve, reject) => {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";

        imgEl.onload = () => {
            const fabricImg = new fabric.FabricImage(imgEl, {
                left: node.x,
                top: node.y,
                angle: node.rotation || 0,
                opacity: node.opacity ?? 1,
                visible: node.visible !== false,
                selectable: node.selectable !== false,
                lockMovementX: node.locked === true,
                lockMovementY: node.locked === true,
                flipX: node.flipX === true,
                flipY: node.flipY === true,
                // Top-left origin to match exported coords
                originX: "left",
                originY: "top",
                // Metadata — mandatory
                data: {
                    id: node.id,
                    type: node.type,
                },
            });

            // Scale image to match the node dimensions
            fabricImg.scaleToWidth(node.width);
            fabricImg.scaleToHeight(node.height);

            // Apply shadow if enabled
            if (node.shadowEnabled) {
                fabricImg.shadow = new fabric.Shadow({
                    color: node.shadowColor || "rgba(0,0,0,0.5)",
                    blur: node.shadowBlur || 0,
                    offsetX: node.shadowOffsetX || 0,
                    offsetY: node.shadowOffsetY || 0,
                });
            }

            resolve(fabricImg);
        };

        imgEl.onerror = (err) => {
            console.warn(`[import] Failed to load image: ${node.src}`, err);
            // Create a placeholder rectangle so layout is preserved
            const placeholder = new fabric.Rect({
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                fill: "#e2e8f0",
                stroke: "#cbd5e1",
                strokeWidth: 1,
                angle: node.rotation || 0,
                opacity: node.opacity ?? 1,
                selectable: node.selectable !== false,
                originX: "left",
                originY: "top",
                data: {
                    id: node.id,
                    type: node.type,
                },
            });
            resolve(placeholder);
        };

        imgEl.src = node.src;
    });
}

/**
 * Converts a full Editor page's children array → Fabric objects.
 * Returns objects in the SAME ORDER as the source array.
 */
export async function pageChildrenToFabricObjects(
    children: EditorElement[]
): Promise<fabric.FabricObject[]> {
    const fabricObjects: fabric.FabricObject[] = [];

    for (const node of children) {
        try {
            switch (node.type) {
                case "text": {
                    const obj = textToFabric(node as EditorTextElement);
                    fabricObjects.push(obj);
                    break;
                }
                case "image": {
                    const obj = await imageToFabric(node as EditorImageElement);
                    fabricObjects.push(obj);
                    break;
                }
                default:
                    // Unknown type — skip but warn (don't crash)
                    console.warn(`[import] Skipping unsupported element type: "${node.type}" (id: ${node.id})`);
                    break;
            }
        } catch (err) {
            console.error(`[import] Error converting element ${node.id}:`, err);
        }
    }

    return fabricObjects;
}

/**
 * Validates the basic structure of a Editor JSON.
 * Returns null if valid, or an error message if invalid.
 */
export function validateEditorJSON(
    json: unknown
): string | null {
    if (!json || typeof json !== "object") {
        return "JSON must be a non-null object";
    }

    const obj = json as Record<string, unknown>;

    if (!Array.isArray(obj.pages)) {
        return 'JSON must have a "pages" array';
    }

    for (let i = 0; i < obj.pages.length; i++) {
        const page = obj.pages[i] as Record<string, unknown>;
        if (!page || typeof page !== "object") {
            return `pages[${i}] must be an object`;
        }
        if (!Array.isArray(page.children)) {
            return `pages[${i}] must have a "children" array`;
        }
        for (let j = 0; j < (page.children as unknown[]).length; j++) {
            const child = (page.children as Record<string, unknown>[])[j];
            if (!child.id || typeof child.id !== "string") {
                return `pages[${i}].children[${j}] must have a string "id"`;
            }
            if (!child.type || typeof child.type !== "string") {
                return `pages[${i}].children[${j}] must have a string "type"`;
            }
        }
    }

    return null;
}

/**
 * Gets the page background color for setting on the Fabric canvas.
 */
export function getPageBackground(page: EditorPage): string {
    return page.background || "#ffffff";
}

// ── Helpers ──

function stripHtml(html: string): string {
    if (!html) return "";
    // Remove HTML tags, decode basic entities
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
}

function parseFontWeight(weight: string | number | undefined): string | number {
    if (!weight) return "normal";
    if (typeof weight === "number") return weight;
    const num = parseInt(weight, 10);
    if (!isNaN(num)) return num;
    return weight; // "bold", "normal", etc.
}

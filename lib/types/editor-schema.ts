/**
 * Editor-compatible JSON schema types.
 * These types mirror the design store JSON format exactly.
 * NEVER rename keys, restructure arrays, or add schema fields.
 */

// ── Base element shared by all node types ──
export interface EditorBaseElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    visible: boolean;
    selectable: boolean;
    draggable: boolean;
    locked: boolean;
    blurEnabled: boolean;
    blurRadius: number;
    brightnessEnabled: boolean;
    brightness: number;
    shadowEnabled: boolean;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowColor: string;
    shadowOpacity: number;
    name: string;
    // Allow extra keys to pass through untouched
    [key: string]: unknown;
}

// ── Text element ──
export interface EditorTextElement extends EditorBaseElement {
    type: "text";
    text: string;
    fontSize: number;
    fontFamily: string;
    fontStyle: string;   // "normal" | "italic"
    fontWeight: string;  // "normal" | "bold" | numeric string
    fill: string;
    align: string;       // "left" | "center" | "right"
    lineHeight: number;
    letterSpacing: number;
    textDecoration: string;
    strokeWidth: number;
    stroke: string;
    // text-specific extras
    [key: string]: unknown;
}

// ── Image element ──
export interface EditorImageElement extends EditorBaseElement {
    type: "image";
    src: string;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    flipX: boolean;
    flipY: boolean;
    borderSize: number;
    borderColor: string;
    // image-specific extras
    [key: string]: unknown;
}

// ── SVG element (pass-through, not rendered in Phase 1) ──
export interface EditorSvgElement extends EditorBaseElement {
    type: "svg";
    src: string;
    [key: string]: unknown;
}

// ── Union of all supported elements ──
export type EditorElement =
    | EditorTextElement
    | EditorImageElement
    | EditorSvgElement
    | EditorBaseElement;

// ── Page (canvas) ──
export interface EditorPage {
    id: string;
    children: EditorElement[];
    width: number;
    height: number;
    background: string;
    // Allow extra page-level keys
    [key: string]: unknown;
}

// ── Root store JSON ──
export interface EditorStoreJSON {
    width: number;
    height: number;
    fonts: EditorFont[];
    pages: EditorPage[];
    // Allow extra top-level keys
    [key: string]: unknown;
}

// ── Font definition ──
export interface EditorFont {
    fontFamily: string;
    url?: string;
    styles?: string[];
    [key: string]: unknown;
}

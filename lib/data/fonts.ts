/**
 * Font registry — curated list of Google Fonts for the editor.
 * Uses the Google Fonts CSS API for loading.
 */

export interface EditorFont {
    family: string;
    category: "serif" | "sans-serif" | "display" | "handwriting" | "monospace";
    weights: number[];
    /** Google Fonts CSS URL to load this font */
    cssUrl: string;
}

/**
 * Curated font list — each has a Google Fonts CSS URL for loading.
 * These are popular, professional fonts suitable for design editors.
 */
export const EDITOR_FONTS: EditorFont[] = [
    {
        family: "Inter",
        category: "sans-serif",
        weights: [300, 400, 500, 600, 700, 800, 900],
        cssUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
    },
    {
        family: "Roboto",
        category: "sans-serif",
        weights: [300, 400, 500, 700, 900],
        cssUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap",
    },
    {
        family: "Poppins",
        category: "sans-serif",
        weights: [300, 400, 500, 600, 700, 800],
        cssUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
    },
    {
        family: "Montserrat",
        category: "sans-serif",
        weights: [300, 400, 500, 600, 700, 800, 900],
        cssUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
    },
    {
        family: "Open Sans",
        category: "sans-serif",
        weights: [300, 400, 600, 700, 800],
        cssUrl: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap",
    },
    {
        family: "Lato",
        category: "sans-serif",
        weights: [300, 400, 700, 900],
        cssUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
    },
    {
        family: "Oswald",
        category: "sans-serif",
        weights: [300, 400, 500, 600, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap",
    },
    {
        family: "Raleway",
        category: "sans-serif",
        weights: [300, 400, 500, 600, 700, 800],
        cssUrl: "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap",
    },
    {
        family: "Nunito",
        category: "sans-serif",
        weights: [300, 400, 600, 700, 800],
        cssUrl: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap",
    },
    {
        family: "Roboto Condensed",
        category: "sans-serif",
        weights: [300, 400, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap",
    },
    {
        family: "Playfair Display",
        category: "serif",
        weights: [400, 500, 600, 700, 800, 900],
        cssUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap",
    },
    {
        family: "Merriweather",
        category: "serif",
        weights: [300, 400, 700, 900],
        cssUrl: "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap",
    },
    {
        family: "Lora",
        category: "serif",
        weights: [400, 500, 600, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
    },
    {
        family: "PT Serif",
        category: "serif",
        weights: [400, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap",
    },
    {
        family: "Libre Baskerville",
        category: "serif",
        weights: [400, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap",
    },
    {
        family: "Anton",
        category: "display",
        weights: [400],
        cssUrl: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
    },
    {
        family: "Bebas Neue",
        category: "display",
        weights: [400],
        cssUrl: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    },
    {
        family: "Abril Fatface",
        category: "display",
        weights: [400],
        cssUrl: "https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap",
    },
    {
        family: "Pacifico",
        category: "handwriting",
        weights: [400],
        cssUrl: "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
    },
    {
        family: "Dancing Script",
        category: "handwriting",
        weights: [400, 500, 600, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap",
    },
    {
        family: "Great Vibes",
        category: "handwriting",
        weights: [400],
        cssUrl: "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap",
    },
    {
        family: "Caveat",
        category: "handwriting",
        weights: [400, 500, 600, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap",
    },
    {
        family: "Fira Code",
        category: "monospace",
        weights: [300, 400, 500, 600, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap",
    },
    {
        family: "JetBrains Mono",
        category: "monospace",
        weights: [400, 500, 700],
        cssUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap",
    },
];

/**
 * Get fonts grouped by category.
 */
export function getFontsByCategory(): Record<string, EditorFont[]> {
    const grouped: Record<string, EditorFont[]> = {};
    for (const font of EDITOR_FONTS) {
        if (!grouped[font.category]) {
            grouped[font.category] = [];
        }
        grouped[font.category].push(font);
    }
    return grouped;
}

/**
 * Find font by family name.
 */
export function getFontByFamily(family: string): EditorFont | undefined {
    return EDITOR_FONTS.find((f) => f.family === family);
}

/**
 * Category display labels.
 */
export const CATEGORY_LABELS: Record<string, string> = {
    "sans-serif": "Sans Serif",
    "serif": "Serif",
    "display": "Display",
    "handwriting": "Handwriting",
    "monospace": "Monospace",
};

/**
 * Loads a Google Font via CSS link injection.
 * Returns a promise that resolves after font is loaded.
 */
export async function loadGoogleFont(font: EditorFont): Promise<boolean> {
    // Check if already loaded
    const existingLink = document.querySelector(`link[data-font="${font.family}"]`);
    if (existingLink) return true;

    return new Promise((resolve) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = font.cssUrl;
        link.setAttribute("data-font", font.family);

        link.onload = async () => {
            // Wait for the font to be available in the rendering engine
            try {
                await document.fonts.load(`16px "${font.family}"`);
                resolve(true);
            } catch {
                resolve(true); // CSS loaded, font may still work
            }
        };

        link.onerror = () => {
            console.warn(`[fonts] Failed to load CSS for "${font.family}"`);
            resolve(false);
        };

        document.head.appendChild(link);
    });
}

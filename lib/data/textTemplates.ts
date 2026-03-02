/**
 * Text template definitions.
 * Each template defines styling that gets applied when adding text to canvas.
 * Templates are stored locally and can be managed via the /editor/templates page.
 */

export interface TextTemplate {
    id: string;
    name: string;
    category: "quick" | "styled";
    preview: string; // The preview text shown in the panel
    style: TextTemplateStyle;
}

export interface TextTemplateStyle {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    fill: string;
    align: string;
    letterSpacing: number;
    lineHeight: number;
    textDecoration: string;
    opacity: number;
}

// ── Quick Add Templates (Header / Subheader / Body) ──
export const QUICK_TEXT_TEMPLATES: TextTemplate[] = [
    {
        id: "quick_header",
        name: "Header",
        category: "quick",
        preview: "Add a heading",
        style: {
            fontSize: 48,
            fontFamily: "Inter",
            fontWeight: "bold",
            fontStyle: "normal",
            fill: "#000000",
            align: "center",
            letterSpacing: -1,
            lineHeight: 1.1,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "quick_subheader",
        name: "Sub Header",
        category: "quick",
        preview: "Add a sub heading",
        style: {
            fontSize: 28,
            fontFamily: "Inter",
            fontWeight: "600",
            fontStyle: "normal",
            fill: "#000000",
            align: "center",
            letterSpacing: 0,
            lineHeight: 1.3,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "quick_body",
        name: "Body Text",
        category: "quick",
        preview: "Add body text",
        style: {
            fontSize: 16,
            fontFamily: "Inter",
            fontWeight: "normal",
            fontStyle: "normal",
            fill: "#000000",
            align: "left",
            letterSpacing: 0,
            lineHeight: 1.6,
            textDecoration: "",
            opacity: 1,
        },
    },
];

// ── Styled Text Templates (Multi-text compositions like Polotno) ──
export const STYLED_TEXT_TEMPLATES: TextTemplate[] = [
    {
        id: "styled_adventure",
        name: "Adventure",
        category: "styled",
        preview: "ADVENTURE",
        style: {
            fontSize: 56,
            fontFamily: "Dancing Script",
            fontWeight: "bold",
            fontStyle: "normal",
            fill: "#f59e0b",
            align: "center",
            letterSpacing: 2,
            lineHeight: 1.2,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_big_brother",
        name: "Big Brother Announcement",
        category: "styled",
        preview: "You're a Big Brother",
        style: {
            fontSize: 42,
            fontFamily: "Dancing Script",
            fontWeight: "bold",
            fontStyle: "normal",
            fill: "#f59e0b",
            align: "center",
            letterSpacing: 1,
            lineHeight: 1.2,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_marketing_proposal",
        name: "Marketing Proposal",
        category: "styled",
        preview: "M.MK and CO\nMARKETING PROPOSAL\n\nAn operational document that outlines an advertising strategy that an organization will implement to generate leads and reach its target market.",
        style: {
            fontSize: 24,
            fontFamily: "Poppins",
            fontWeight: "normal",
            fontStyle: "normal",
            fill: "#000000",
            align: "left",
            letterSpacing: 0,
            lineHeight: 1.6,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_operations_manager",
        name: "Operations Manager Job",
        category: "styled",
        preview: "LOOKING FOR\nOPERATIONS MANAGER\n\nWe are seeking an experienced Operations Manager to oversee daily operations and ensure efficient workflow. Join our dynamic team and make a difference.",
        style: {
            fontSize: 22,
            fontFamily: "Roboto Condensed",
            fontWeight: "bold",
            fontStyle: "normal",
            fill: "#64748b",
            align: "left",
            letterSpacing: 3,
            lineHeight: 1.5,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_season_sale",
        name: "End of Season Sale",
        category: "styled",
        preview: "END OF SEASON\nSALE",
        style: {
            fontSize: 64,
            fontFamily: "Anton",
            fontWeight: "normal",
            fontStyle: "normal",
            fill: "#ef4444",
            align: "center",
            letterSpacing: 4,
            lineHeight: 1.1,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_future_design",
        name: "Future of Design",
        category: "styled",
        preview: "The Future Of Design\nMINIMALISM",
        style: {
            fontSize: 32,
            fontFamily: "Montserrat",
            fontWeight: "300",
            fontStyle: "normal",
            fill: "#000000",
            align: "center",
            letterSpacing: 8,
            lineHeight: 1.4,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_invitation",
        name: "Event Invitation",
        category: "styled",
        preview: "You're Invited\n\nJoin us for a special celebration\nDate: Saturday, December 15th\nTime: 7:00 PM\nLocation: Grand Ballroom",
        style: {
            fontSize: 28,
            fontFamily: "Great Vibes",
            fontWeight: "normal",
            fontStyle: "normal",
            fill: "#7c3aed",
            align: "center",
            letterSpacing: 1,
            lineHeight: 1.6,
            textDecoration: "",
            opacity: 1,
        },
    },
    {
        id: "styled_price_list",
        name: "Service Price List",
        category: "styled",
        preview: "PRICE LIST:\n\nMarketing package $40\nAdvertising Package $20\nContent Creation Package $30",
        style: {
            fontSize: 26,
            fontFamily: "Poppins",
            fontWeight: "700",
            fontStyle: "normal",
            fill: "#0ea5e9",
            align: "left",
            letterSpacing: 1,
            lineHeight: 1.8,
            textDecoration: "",
            opacity: 1,
        },
    },
];

/**
 * Get all templates combined.
 */
export function getAllTemplates(): TextTemplate[] {
    return [...QUICK_TEXT_TEMPLATES, ...STYLED_TEXT_TEMPLATES];
}

/**
 * Find a template by ID.
 */
export function getTemplateById(id: string): TextTemplate | undefined {
    return getAllTemplates().find((t) => t.id === id);
}

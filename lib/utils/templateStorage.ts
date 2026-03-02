"use client";

import { TextTemplate, QUICK_TEXT_TEMPLATES, STYLED_TEXT_TEMPLATES } from "../data/textTemplates";

/**
 * Manages text templates in localStorage.
 * Initialized with default templates if empty.
 */
const TEMPLATES_KEY = "editor_text_templates";
const TEMPLATES_VERSION_KEY = "editor_text_templates_version";
const CURRENT_VERSION = "2.0"; // Increment when templates change

export const TemplateStorage = {
    getTemplates: (): TextTemplate[] => {
        if (typeof window === "undefined") return [...QUICK_TEXT_TEMPLATES, ...STYLED_TEXT_TEMPLATES];

        const stored = localStorage.getItem(TEMPLATES_KEY);
        const storedVersion = localStorage.getItem(TEMPLATES_VERSION_KEY);
        
        // If no templates or version mismatch, reset to defaults
        if (!stored || storedVersion !== CURRENT_VERSION) {
            const defaultTemplates = [...QUICK_TEXT_TEMPLATES, ...STYLED_TEXT_TEMPLATES];
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
            localStorage.setItem(TEMPLATES_VERSION_KEY, CURRENT_VERSION);
            return defaultTemplates;
        }

        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse templates from localStorage", e);
            const defaultTemplates = [...QUICK_TEXT_TEMPLATES, ...STYLED_TEXT_TEMPLATES];
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
            localStorage.setItem(TEMPLATES_VERSION_KEY, CURRENT_VERSION);
            return defaultTemplates;
        }
    },

    addTemplate: (template: TextTemplate) => {
        const templates = TemplateStorage.getTemplates();
        const updated = [...templates, template];
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
        return updated;
    },

    deleteTemplate: (id: string) => {
        const templates = TemplateStorage.getTemplates();
        const updated = templates.filter(t => t.id !== id);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
        return updated;
    },

    resetDefaults: () => {
        const defaultTemplates = [...QUICK_TEXT_TEMPLATES, ...STYLED_TEXT_TEMPLATES];
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
        localStorage.setItem(TEMPLATES_VERSION_KEY, CURRENT_VERSION);
        return defaultTemplates;
    }
};

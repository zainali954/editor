"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2, RotateCcw } from "lucide-react";
import { EDITOR_FONTS } from "@/lib/data/fonts";
import { TemplateStorage } from "@/lib/utils/templateStorage";
import { TextTemplate, TextTemplateStyle } from "@/lib/data/textTemplates";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<TextTemplate[]>([]);
    const [newTemplate, setNewTemplate] = useState<Partial<TextTemplate>>({
        name: "",
        category: "styled",
        preview: "New Template Text",
        style: {
            fontSize: 32,
            fontFamily: "Inter",
            fontWeight: "normal",
            fontStyle: "normal",
            fill: "#000000",
            align: "center",
            letterSpacing: 0,
            lineHeight: 1.2,
            textDecoration: "",
            opacity: 1,
        }
    });

    useEffect(() => {
        setTemplates(TemplateStorage.getTemplates());
    }, []);

    const handleSave = () => {
        if (!newTemplate.name) return alert("Template name is required.");

        const template: TextTemplate = {
            id: `template_${Date.now()}`,
            name: newTemplate.name,
            category: "styled",
            preview: newTemplate.preview || "Text",
            style: newTemplate.style as TextTemplateStyle,
        };

        const updated = TemplateStorage.addTemplate(template);
        setTemplates(updated);
        // Reset form
        setNewTemplate({
            name: "",
            category: "styled",
            preview: "New Template Text",
            style: { ...newTemplate.style } as TextTemplateStyle
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this template?")) {
            setTemplates(TemplateStorage.deleteTemplate(id));
        }
    };

    const handleReset = () => {
        if (confirm("Reset all templates to defaults? This will erase your custom ones.")) {
            setTemplates(TemplateStorage.resetDefaults());
        }
    };

    const updateStyle = (key: keyof TextTemplateStyle, value: any) => {
        setNewTemplate(prev => ({
            ...prev,
            style: {
                ...prev.style as TextTemplateStyle,
                [key]: value
            }
        }));
    };

    return (
        <div className="min-h-screen bg-canvas-bg p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/editor"
                            className="p-2 hover:bg-brand-secondary rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-foreground" />
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Manage Text Templates</h1>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Defaults
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-1 space-y-6 bg-background p-6 rounded-2xl premium-shadow border border-border-color">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-brand-primary" />
                            Create Template
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-muted-text">Template Name</label>
                                <input
                                    type="text"
                                    value={newTemplate.name}
                                    onChange={e => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-brand-secondary border border-border-color rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    placeholder="e.g. Modern Bold Title"
                                />
                            </div>

                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-muted-text">Preview Text</label>
                                <input
                                    type="text"
                                    value={newTemplate.preview}
                                    onChange={e => setNewTemplate(prev => ({ ...prev, preview: e.target.value }))}
                                    className="w-full px-3 py-2 bg-brand-secondary border border-border-color rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 font-medium">
                                    <label className="text-sm text-muted-text">Font Size</label>
                                    <input
                                        type="number"
                                        value={newTemplate.style?.fontSize}
                                        onChange={e => updateStyle("fontSize", parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-brand-secondary border border-border-color rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5 font-medium">
                                    <label className="text-sm text-muted-text">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={newTemplate.style?.fill}
                                            onChange={e => updateStyle("fill", e.target.value)}
                                            className="w-10 h-10 p-1 bg-brand-secondary border border-border-color rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={newTemplate.style?.fill}
                                            onChange={e => updateStyle("fill", e.target.value)}
                                            className="flex-1 w-full px-3 py-2 bg-brand-secondary border border-border-color rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-muted-text">Font Family</label>
                                <select
                                    value={newTemplate.style?.fontFamily}
                                    onChange={e => updateStyle("fontFamily", e.target.value)}
                                    className="w-full px-3 py-2 bg-brand-secondary border border-border-color rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                                >
                                    {EDITOR_FONTS.map(font => (
                                        <option key={font.family} value={font.family}>{font.family}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 font-medium">
                                <label className="text-sm text-muted-text">Font Weight</label>
                                <select
                                    value={newTemplate.style?.fontWeight}
                                    onChange={e => updateStyle("fontWeight", e.target.value)}
                                    className="w-full px-3 py-2 bg-brand-secondary border border-border-color rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                    <option value="300">Light</option>
                                    <option value="600">Semi Bold</option>
                                    <option value="900">Black</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-hover transition-all premium-shadow"
                            >
                                <Save className="w-5 h-5" />
                                Save Template
                            </button>
                        </div>
                    </div>

                    {/* List Display */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold">Your Text Templates</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-background rounded-2xl border border-border-color overflow-hidden flex flex-col group animate-in"
                                >
                                    <div className="flex-1 p-8 flex items-center justify-center min-h-[160px] bg-slate-50 dark:bg-slate-900/50">
                                        <p
                                            style={{
                                                fontFamily: template.style.fontFamily,
                                                fontSize: Math.min(template.style.fontSize * 0.8, 48),
                                                color: template.style.fill,
                                                fontWeight: template.style.fontWeight as any,
                                                fontStyle: template.style.fontStyle,
                                                letterSpacing: template.style.letterSpacing,
                                                textAlign: template.style.align as any,
                                                opacity: template.style.opacity,
                                            }}
                                        >
                                            {template.preview}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3 bg-background border-t border-border-color flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm">{template.name}</p>
                                            <p className="text-[10px] text-muted-text uppercase tracking-wider">{template.style.fontFamily}</p>
                                        </div>
                                        {template.id.startsWith("template_") && (
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="p-2 text-muted-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

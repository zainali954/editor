"use client";

import React from "react";
import {
    Folder,
    Type,
    Image,
    LayoutTemplate,
    Shapes,
} from "lucide-react";
import { useEditorStore, type SidebarPanel } from "@/lib/store/editorStore";

interface SidebarItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    panel?: SidebarPanel;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, panel }) => {
    const { activeSidebarPanel, toggleSidebarPanel } = useEditorStore();
    const isActive = panel ? activeSidebarPanel === panel : false;

    const handleClick = () => {
        if (panel) {
            toggleSidebarPanel(panel);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`
        group flex flex-row md:flex-col items-center justify-center py-2 px-3 md:py-2.5 md:px-1 gap-2 md:gap-1
        cursor-pointer transition-all duration-200 relative shrink-0
        ${isActive
                    ? "text-brand-primary"
                    : "text-muted-text hover:text-brand-primary"
                }
      `}
        >
            <div
                className={`
          p-2 rounded-xl transition-all duration-200 shrink-0
          ${isActive
                        ? "bg-brand-primary/10"
                        : "group-hover:bg-brand-secondary"
                    }
        `}
            >
                <Icon className="w-5 h-5" />
            </div>
            <span
                className={`
          text-xs md:text-[10px] font-semibold tracking-tight uppercase leading-none shrink-0
          transition-opacity duration-200
          ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}
        `}
            >
                {label}
            </span>

            {/* Active indicator - bottom on mobile, right on desktop */}
            {isActive && (
                <>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-brand-primary rounded-t-full md:hidden" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-brand-primary rounded-l-full hidden md:block" />
                </>
            )}
        </button>
    );
};

const Sidebar: React.FC = () => {
    return (
        <aside className="bg-sidebar-bg flex flex-row items-center py-2 px-2 shrink-0 transition-colors gap-1 md:flex-col md:w-[68px] md:border-r md:border-border-color md:px-1 md:py-3 md:gap-0.5">
            <SidebarItem icon={Folder} label="Designs" />
            <SidebarItem icon={LayoutTemplate} label="Templates" panel="templates" />
            <SidebarItem icon={Type} label="Text" panel="text" />
            <SidebarItem icon={Image} label="Photos" panel="photos" />
            <SidebarItem icon={Shapes} label="Shapes" panel="shapes" />
        </aside>
    );
};

export default Sidebar;

import React from 'react';
import { Folder } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <div className={`
    group flex flex-col items-center justify-center w-full py-3 px-1 gap-1 cursor-pointer transition-all duration-300 relative
    ${active ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-foreground'}
  `}>
        <div className={`
      p-2 rounded-xl transition-all duration-300
      ${active ? 'bg-brand-primary/10' : 'group-hover:bg-brand-secondary/80'}
    `}>
            <Icon className="w-6 h-6" />
        </div>
        <span className={`text-[10px] font-semibold tracking-tight transition-opacity duration-300 uppercase
      ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}
    `}>
            {label}
        </span>
    </div>
);

const Sidebar = () => {
    return (
        <aside className="w-16 bg-sidebar-bg border-r border-border-color flex flex-col items-center py-4 shrink-0 transition-colors">
            <SidebarItem icon={Folder} label="My Designs" active />
        </aside>
    );
};

export default Sidebar;

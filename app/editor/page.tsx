import React from 'react';
import TopBar from '@/components/editor/TopBar';
import Toolbar from '@/components/editor/Toolbar';
import Sidebar from '@/components/editor/Sidebar';
import Canvas from '@/components/editor/Canvas';
import CanvasControls from '@/components/editor/CanvasControls';

export default function EditorPage() {
    return (
        <div className="flex flex-col h-screen w-full bg-background overflow-hidden selection:bg-brand-primary/20">
            <TopBar />
            <Toolbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <Canvas />
                    <CanvasControls />
                </div>
            </div>
        </div>
    );
}

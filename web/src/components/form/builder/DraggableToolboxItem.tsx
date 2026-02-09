"use client";

import { useDraggable } from "@dnd-kit/core";

interface DraggableToolboxItemProps {
    type: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

export function DraggableToolboxItem({ type, label, icon, onClick }: DraggableToolboxItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolbox-${type}`,
        data: {
            type: "toolbox-item",
            itemType: type,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            onClick={onClick}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm flex items-center gap-3"
        >
            <div className="text-slate-400">
                {icon || <span className="material-symbols-outlined text-xl">drag_indicator</span>}
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
    );
}

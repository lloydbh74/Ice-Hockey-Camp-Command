'use client';

import React from 'react';

interface Session {
    id: number;
    camp_day_id: number;
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    stream_ids: number[];
}

interface SessionCardProps {
    session: Session;
    onDelete: () => void;
    onClick: () => void;
}

export function SessionCard({ session, onDelete, onClick }: SessionCardProps) {
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    };

    return (
        <div
            onClick={onClick}
            className="h-full bg-blue-500 text-white rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden"
        >
            {/* Session Content */}
            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-sm leading-tight flex-1">{session.name}</h4>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                        aria-label="Delete session"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>

                <div className="text-xs opacity-90 mt-1">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </div>

                {session.location && (
                    <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {session.location}
                    </div>
                )}

                {session.description && (
                    <div className="text-xs opacity-75 mt-1 line-clamp-2">
                        {session.description}
                    </div>
                )}
            </div>

            {/* Drag Handle (for future drag-and-drop) */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity">
                <span className="material-symbols-outlined text-sm">drag_indicator</span>
            </div>
        </div>
    );
}

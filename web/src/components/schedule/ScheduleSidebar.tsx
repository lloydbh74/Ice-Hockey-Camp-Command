"use client";

import React, { useState, useEffect } from 'react';
import { CampDay } from '@/lib/db';
import { DayManager } from './DayManager';
import { StreamManager } from './StreamManager';

interface ScheduleSidebarProps {
    campId: number;
    selectedDayId: number | null;
    onSelectDay: (dayId: number | null) => void;
    onStreamsUpdate?: () => void;
}

export function ScheduleSidebar({ campId, selectedDayId, onSelectDay, onStreamsUpdate }: ScheduleSidebarProps) {
    const [days, setDays] = useState<CampDay[]>([]);
    const [loading, setLoading] = useState(false);

    // UI States for Modals/Panels
    const [showDayManager, setShowDayManager] = useState(false);
    const [showStreamManager, setShowStreamManager] = useState(false);

    const fetchDays = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/camps/${campId}/days`);
            if (!res.ok) throw new Error('Failed to fetch days');
            const data = await res.json() as any;
            setDays(data.results || []);

            // Auto-select first day if none selected and days exist
            if (!selectedDayId && data.results && data.results.length > 0) {
                onSelectDay(data.results[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campId) fetchDays();
    }, [campId, showDayManager]); // Refetch when DayManager closes (potentially updated)

    return (
        <aside className="w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg mb-1">Schedule Planner</h2>
                <p className="text-xs text-slate-500">Manage days and streams</p>
            </div>

            {/* Actions */}
            <div className="p-4 grid grid-cols-2 gap-2">
                <button
                    onClick={() => setShowDayManager(!showDayManager)}
                    className={`px-3 py-2 text-xs font-medium rounded border transition-colors flex items-center justify-center gap-1
                        ${showDayManager
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Manage Days
                </button>
                <button
                    onClick={() => setShowStreamManager(!showStreamManager)}
                    className={`px-3 py-2 text-xs font-medium rounded border transition-colors flex items-center justify-center gap-1
                         ${showStreamManager
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Manage Streams
                </button>
            </div>

            {/* Toggleable Panels */}
            {showDayManager && (
                <div className="px-4 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <DayManager campId={campId} onUpdate={fetchDays} />
                </div>
            )}

            {showStreamManager && (
                <div className="px-4 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <StreamManager campId={campId} onUpdate={onStreamsUpdate} />
                </div>
            )}

            {/* Days List Navigation */}
            <div className="flex-1 p-2">
                <h3 className="px-3 py-2 text-xs font-bold uppercase text-slate-500 tracking-wider">Camp Days</h3>
                <div className="space-y-1">
                    {loading && <p className="px-3 text-sm text-slate-400">Loading days...</p>}
                    {!loading && days.length === 0 && (
                        <p className="px-3 text-sm text-slate-400 italic">No days scheduled yet.</p>
                    )}
                    {days.map(day => (
                        <button
                            key={day.id}
                            onClick={() => onSelectDay(day.id)}
                            className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-all
                                ${selectedDayId === day.id
                                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-lg ${selectedDayId === day.id ? 'text-primary' : 'text-slate-400'}`}>
                                event
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm">{day.label || 'Unnamed Day'}</span>
                                <span className="text-[10px] opacity-70">{new Date(day.date).toLocaleDateString()}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}

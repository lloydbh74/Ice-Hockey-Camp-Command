"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ScheduleSidebar } from '@/components/schedule/ScheduleSidebar';
import { TimelineGrid } from '@/components/schedule/TimelineGrid';

interface Stream {
    id: number;
    camp_id: number;
    name: string;
    status: string;
}

export default function CampSchedulePage() {
    const params = useParams();
    const campId = params?.id ? parseInt(params.id as string) : 0;

    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loadingStreams, setLoadingStreams] = useState(false);

    useEffect(() => {
        if (campId) {
            fetchStreams();
        }
    }, [campId]);

    const fetchStreams = async () => {
        setLoadingStreams(true);
        try {
            const res = await fetch(`/api/admin/camps/${campId}/streams`);
            if (res.ok) {
                const data = await res.json() as any;
                setStreams(data.results || []);
            }
        } catch (e) {
            console.error('Failed to fetch streams:', e);
        } finally {
            setLoadingStreams(false);
        }
    };

    // Initial check (can be expanded)
    if (!campId) {
        return <div className="p-8 text-center text-slate-500">Invalid Camp ID</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Sidebar with Day/Stream Management */}
            <ScheduleSidebar
                campId={campId}
                selectedDayId={selectedDayId}
                onSelectDay={setSelectedDayId}
                onStreamsUpdate={fetchStreams}
            />

            {/* Main Content Area (Timeline / Planner) */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
                {!selectedDayId ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">calendar_today</span>
                        <p className="text-lg font-medium">Select a camp day to start scheduling</p>
                        <p className="text-sm">Use the sidebar to create or select days.</p>
                    </div>
                ) : (
                    <TimelineGrid
                        campId={campId}
                        dayId={selectedDayId}
                        streams={streams}
                        onSessionUpdate={() => { }}
                    />
                )}
            </main>
        </div>
    );
}

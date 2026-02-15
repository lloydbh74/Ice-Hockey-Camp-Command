'use client';

import React, { useState, useEffect } from 'react';
import { SessionCard } from './SessionCard';
import { SessionForm } from './SessionForm';
import { SessionEditForm } from './SessionEditForm';

interface Stream {
    id: number;
    name: string;
}

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

interface TimelineGridProps {
    campId: number;
    dayId: number;
    streams: Stream[];
    onSessionUpdate: () => void;
}

export function TimelineGrid({ campId, dayId, streams, onSessionUpdate }: TimelineGridProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);

    // Time range: 6 AM to 10 PM (16 hours)
    const startHour = 6;
    const endHour = 22;
    const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

    useEffect(() => {
        if (dayId) {
            fetchSessions();
        }
    }, [dayId]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/camps/${campId}/days/${dayId}/sessions`);
            if (res.ok) {
                const data = await res.json() as any;
                setSessions(data.results || []);
            }
        } catch (e) {
            console.error('Failed to fetch sessions:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if (!confirm('Delete this session?')) return;

        try {
            const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchSessions();
                onSessionUpdate();
            }
        } catch (e) {
            console.error('Failed to delete session:', e);
        }
    };

    // Convert time string (HH:MM) to position percentage
    const timeToPosition = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = (hours - startHour) * 60 + minutes;
        const totalDayMinutes = (endHour - startHour) * 60;
        return (totalMinutes / totalDayMinutes) * 100;
    };

    // Calculate session height based on duration
    const getSessionHeight = (start: string, end: string): number => {
        const startPos = timeToPosition(start);
        const endPos = timeToPosition(end);
        return endPos - startPos;
    };

    // Check if two sessions overlap
    const sessionsOverlap = (s1: Session, s2: Session): boolean => {
        if (s1.id === s2.id) return false;
        const s1Start = s1.start_time;
        const s1End = s1.end_time;
        const s2Start = s2.start_time;
        const s2End = s2.end_time;
        return s1Start < s2End && s2Start < s1End;
    };

    // Check if session has conflicts
    const hasConflict = (session: Session, streamId: number): boolean => {
        return sessions.some(s =>
            s.id !== session.id &&
            s.stream_ids.includes(streamId) &&
            sessionsOverlap(session, s)
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-500">Loading sessions...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Timeline</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Session
                </button>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto">
                <div className="flex">
                    {/* Time Labels */}
                    <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-800">
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-slate-100 dark:border-slate-900 flex items-start justify-end pr-2 pt-1">
                                <span className="text-xs text-slate-500 font-medium">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Stream Columns */}
                    <div className="flex-1 flex">
                        {streams.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                No streams created yet. Add streams to start scheduling.
                            </div>
                        ) : (
                            streams.map(stream => (
                                <div key={stream.id} className="flex-1 border-r border-slate-200 dark:border-slate-800 relative">
                                    {/* Stream Header */}
                                    <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700 p-2 text-center z-10">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{stream.name}</span>
                                    </div>

                                    {/* Hour Grid */}
                                    <div className="relative" style={{ height: `${hours.length * 80}px` }}>
                                        {hours.map((hour, idx) => (
                                            <div
                                                key={hour}
                                                className="absolute w-full h-20 border-b border-slate-100 dark:border-slate-900"
                                                style={{ top: `${idx * 80}px` }}
                                            />
                                        ))}

                                        {/* Sessions for this stream */}
                                        {sessions
                                            .filter(s => s.stream_ids.includes(stream.id))
                                            .map(session => {
                                                const top = timeToPosition(session.start_time);
                                                const height = getSessionHeight(session.start_time, session.end_time);
                                                const conflict = hasConflict(session, stream.id);

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className={`absolute left-1 right-1 ${conflict ? 'ring-2 ring-red-500' : ''}`}
                                                        style={{
                                                            top: `${top}%`,
                                                            height: `${height}%`
                                                        }}
                                                    >
                                                        <SessionCard
                                                            session={session}
                                                            onDelete={() => handleDeleteSession(session.id)}
                                                            onClick={() => setEditingSession(session)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add Session Modal */}
            {showAddModal && (
                <SessionForm
                    campId={campId}
                    dayId={dayId}
                    streams={streams}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchSessions();
                        onSessionUpdate();
                    }}
                />
            )}

            {/* Edit Session Modal */}
            {editingSession && (
                <SessionEditForm
                    session={editingSession}
                    campId={campId}
                    dayId={dayId}
                    streams={streams}
                    onClose={() => setEditingSession(null)}
                    onSuccess={() => {
                        fetchSessions();
                        onSessionUpdate();
                    }}
                />
            )}
        </div>
    );
}

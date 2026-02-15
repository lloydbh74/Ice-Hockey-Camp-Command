"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Session {
    id: number;
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    stream_ids: number[];
}

interface Stream {
    id: number;
    name: string;
}

export default function CoachDayView({ params }: { params: Promise<{ id: string; dayId: string }> }) {
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const streamIdParam = searchParams.get('streamId');

    const campId = resolvedParams.id;
    const dayId = resolvedParams.dayId;

    const [sessions, setSessions] = useState<Session[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial filter from query param
    useEffect(() => {
        if (streamIdParam && !isNaN(parseInt(streamIdParam))) {
            setSelectedStreamId(parseInt(streamIdParam));
        }
    }, [streamIdParam]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sessionsRes, streamsRes] = await Promise.all([
                    fetch(`/api/public/camps/${campId}/days/${dayId}/sessions`),
                    fetch(`/api/public/camps/${campId}/streams`)
                ]);

                if (!sessionsRes.ok || !streamsRes.ok) throw new Error("Failed to load schedule data");

                const sessionsData = await sessionsRes.json();
                const streamsData = await streamsRes.json();

                setSessions(sessionsData.results || []);
                setStreams(streamsData.results || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campId, dayId]);

    const filteredSessions = selectedStreamId
        ? sessions.filter(s => s.stream_ids.includes(selectedStreamId))
        : sessions;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Loading sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 lg:px-12">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link href={`/coach/camps/${campId}`} className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black tracking-tight">Daily Schedule</h1>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Swedish Camp Command</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 pb-32">
                {/* Filter Bar */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide flex gap-2">
                    <button
                        onClick={() => setSelectedStreamId(null)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${selectedStreamId === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        All Groups
                    </button>
                    {streams.map(stream => (
                        <button
                            key={stream.id}
                            onClick={() => setSelectedStreamId(stream.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${selectedStreamId === stream.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {stream.name}
                        </button>
                    ))}
                </div>

                {/* Timeline List */}
                {filteredSessions.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <span className="material-symbols-outlined text-slate-600 text-4xl mb-4">event_busy</span>
                        <p className="text-slate-500 font-medium">No sessions scheduled for this group.</p>
                    </div>
                ) : (
                    <div className="space-y-6 relative border-l border-white/5 ml-4 pl-8">
                        {filteredSessions.map((session, index) => (
                            <div key={session.id} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-1 px-1 bg-slate-950">
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/80 transition-all border-l-4 border-l-blue-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-black tracking-tighter w-fit">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {session.start_time} - {session.end_time}
                                        </div>
                                        {session.location && (
                                            <div className="inline-flex items-center gap-2 text-slate-500 text-xs font-bold bg-white/5 px-3 py-1 rounded-lg w-fit">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {session.location}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-black text-white mb-2 leading-tight">
                                        {session.name}
                                    </h3>

                                    {session.description && (
                                        <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                                            {session.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {session.stream_ids.map(sid => {
                                            const stream = streams.find(s => s.id === sid);
                                            return stream ? (
                                                <span key={sid} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded transition-colors group-hover:border-blue-500/30">
                                                    {stream.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-md border-t border-white/5 text-center flex items-center justify-center gap-8">
                <Link href={`/coach/camps/${campId}`} className="text-[10px] font-black text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">home</span>
                    All Days
                </Link>
                <div className="h-3 w-px bg-white/10"></div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Port: Stockholm Command
                </p>
            </footer>
        </div>
    );
}

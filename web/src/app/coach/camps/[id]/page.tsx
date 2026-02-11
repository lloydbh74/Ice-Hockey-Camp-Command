"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CampDay {
    id: number;
    date: string;
    label?: string;
}

export default function CoachCampLanding({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const campId = resolvedParams.id;
    const [days, setDays] = useState<CampDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDays = async () => {
            try {
                const res = await fetch(`/api/public/camps/${campId}/days`);
                if (!res.ok) throw new Error("Failed to fetch schedule");
                const data = await res.json();
                setDays(data.results || []);

                // If there's only one day, auto-redirect
                if (data.results?.length === 1) {
                    router.replace(`/coach/camps/${campId}/day/${data.results[0].id}`);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDays();
    }, [campId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Loading Schedule...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md">
                    <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
                    <h1 className="text-xl font-bold text-white mb-2">Schedule Error</h1>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <header className="max-w-xl mx-auto mb-12 text-center pt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-500/20">
                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                    Coach Port Access
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Camp Schedule</h1>
                <p className="text-slate-400 text-sm">Select a day to view sessions and groups.</p>
            </header>

            <div className="max-w-xl mx-auto space-y-4">
                {days.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <span className="material-symbols-outlined text-slate-600 text-4xl mb-4">calendar_today</span>
                        <p className="text-slate-500 font-medium">No days scheduled yet.</p>
                    </div>
                ) : (
                    days.map((day) => (
                        <Link
                            key={day.id}
                            href={`/coach/camps/${campId}/day/${day.id}`}
                            className="group block bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">
                                        {day.label ? day.label : 'Camp Day'}
                                    </div>
                                    <div className="text-xl font-black text-white capitalize">
                                        {new Date(day.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                    arrow_forward
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-md border-t border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Swedish Camp Command &copy; 2026
                </p>
            </footer>
        </div>
    );
}

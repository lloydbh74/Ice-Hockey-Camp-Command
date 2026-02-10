"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Camp {
    id: number;
    name: string;
    year: number;
    status: string;
}

export default function AdminDashboardPage() {
    const [camps, setCamps] = useState<Camp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/camps")
            .then((res) => res.json())
            .then((data) => {
                setCamps(data.results || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch camps", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Organiser Dashboard</h1>
                <p className="text-slate-500 mt-2">Select a camp to view statistics and manage registrations.</p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {camps.map((camp) => (
                        <Link
                            key={camp.id}
                            href={`/admin/camps/${camp.id}`}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-xl">camping</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${camp.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {camp.status}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {camp.name}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium">{camp.year} Season</p>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-blue-600 dark:text-blue-400 text-sm font-bold">
                                <span>Open Dashboard</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    ))}

                    {camps.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory</span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No camps found</h3>
                            <p className="text-slate-500 mt-2">Get started by creating your first camp in settings.</p>
                            <Link href="/admin/settings/camps" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition-all">
                                <span>Camp Management</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

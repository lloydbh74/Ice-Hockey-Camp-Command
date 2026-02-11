"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Camp {
    id: number;
    name: string;
    year: number;
    status: string;
}

export default function CampManagementPage() {
    const [camps, setCamps] = useState<Camp[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCamp, setNewCamp] = useState({ name: "", year: new Date().getFullYear() + 1 });

    useEffect(() => {
        fetchCamps();
    }, []);

    const fetchCamps = async () => {
        try {
            const res = await fetch("/api/admin/camps", {
                headers: { 'X-Admin-Token': 'swedish-camp-admin-2026' }
            });
            if (!res.ok) {
                const errorData: any = await res.json();
                throw new Error(errorData.error || "Failed to fetch camps");
            }
            const data = await res.json();
            // Handle both { results: [...] } and plain array formats
            setCamps(data.results || data || []);
        } catch (e: any) {
            console.error("Failed to fetch camps", e);
            // Optionally set an error state here if we add one
            setCamps([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/admin/camps", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': 'swedish-camp-admin-2026'
                },
                body: JSON.stringify(newCamp),
            });
            if (res.ok) {
                setShowCreateModal(false);
                fetchCamps();
            }
        } catch (e) {
            console.error("Failed to create camp", e);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Camp Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure and manage hockey camp sessions.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                    aria-haspopup="dialog"
                >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                    Create New Camp
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-100 rounded-xl border border-slate-200"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {camps.map((camp) => (
                        <div key={camp.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${camp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {camp.status}
                                </span>
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4" aria-hidden="true">
                                    <span className="material-symbols-outlined">camping</span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{camp.name}</h3>
                                <p className="text-slate-500 text-sm font-medium">{camp.year} Season</p>

                                <div className="mt-auto pt-6 flex items-center gap-2">
                                    <Link
                                        href={`/admin/camps/${camp.id}/dashboard`}
                                        className="flex-1 text-xs font-bold py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
                                        aria-label={`Manage dashboard for ${camp.name}`}
                                    >
                                        Manage Dashboard
                                    </Link>
                                    <Link
                                        href={`/admin/settings/camps/${camp.id}`}
                                        className="flex-1 text-xs font-bold py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-center"
                                        aria-label={`Edit settings for ${camp.name}`}
                                    >
                                        Edit Settings
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {camps.length === 0 && !loading && (
                        <div className="col-span-full py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4" aria-hidden="true">
                                <span className="material-symbols-outlined text-4xl">camping</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Camps Found</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">Get started by creating your first camp session for the upcoming season.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-6 text-primary font-bold text-sm hover:underline"
                            >
                                + Create First Camp
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white">New Camp Session</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="camp-name" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Camp Name</label>
                                <input
                                    id="camp-name"
                                    type="text"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    placeholder="e.g. CIHA Swedish Hockey Camp 2027"
                                    value={newCamp.name}
                                    onChange={e => setNewCamp({ ...newCamp, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="camp-year" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Year</label>
                                <input
                                    id="camp-year"
                                    type="number"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-slate-100"
                                    value={newCamp.year}
                                    onChange={e => setNewCamp({ ...newCamp, year: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                            >
                                Create Camp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

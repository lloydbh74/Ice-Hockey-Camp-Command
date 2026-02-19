"use client";

export const runtime = 'edge';


import React, { useState, useEffect } from "react";

interface Camp {
    id: number;
    name: string;
    year: number;
    status: string;
}

interface CampSettings {
    camp_id: number;
    reminders_enabled: number;
    reminder_cadence_days: number;
    max_reminders: number;
}

interface CampWithSettings extends Camp {
    settings: CampSettings;
}

const ADMIN_TOKEN = 'swedish-camp-admin-2026';

export default function ReminderSettingsPage() {
    const [camps, setCamps] = useState<CampWithSettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCamp, setEditingCamp] = useState<CampWithSettings | null>(null);

    useEffect(() => {
        fetchCamps();
    }, []);

    const fetchCamps = async () => {
        try {
            const res = await fetch("/api/admin/camps", {
                headers: { 'X-Admin-Token': ADMIN_TOKEN }
            });
            if (!res.ok) throw new Error("Failed to fetch camps");

            const data = await res.json() as { results: Camp[] };
            const campsData = data.results || [];

            // Fetch settings for each camp
            const campsWithSettings = await Promise.all(
                campsData.map(async (camp) => {
                    try {
                        const settingsRes = await fetch(`/api/admin/camps/${camp.id}/settings`, {
                            headers: { 'X-Admin-Token': ADMIN_TOKEN }
                        });
                        const settingsData = await settingsRes.json() as CampSettings | { error: string };

                        // Handle the case where settings are not found (provide defaults)
                        if ('error' in settingsData) {
                            return {
                                ...camp,
                                settings: {
                                    camp_id: camp.id,
                                    reminders_enabled: 1,
                                    reminder_cadence_days: 7,
                                    max_reminders: 3
                                }
                            };
                        }

                        return { ...camp, settings: settingsData as CampSettings };
                    } catch (e) {
                        console.error(`Failed to fetch settings for camp ${camp.id}`, e);
                        // Return with default settings on error
                        return {
                            ...camp,
                            settings: {
                                camp_id: camp.id,
                                reminders_enabled: 1,
                                reminder_cadence_days: 7,
                                max_reminders: 3
                            }
                        };
                    }
                })
            );

            setCamps(campsWithSettings);
        } catch (e) {
            console.error("Failed to fetch camps", e);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (camp: CampWithSettings) => {
        setEditingCamp({ ...camp });
    };

    const handleSave = async () => {
        if (!editingCamp) return;

        try {
            const res = await fetch(`/api/admin/camps/${editingCamp.id}/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify({
                    remindersEnabled: editingCamp.settings.reminders_enabled === 1,
                    reminderCadenceDays: editingCamp.settings.reminder_cadence_days,
                    maxReminders: editingCamp.settings.max_reminders
                })
            });

            if (res.ok) {
                setEditingCamp(null);
                fetchCamps();
            } else {
                const error = await res.json() as { error: string };
                alert(`Failed to save: ${error.error}`);
            }
        } catch (e) {
            console.error("Failed to save settings", e);
            alert("Failed to save settings");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reminder Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure reminder intervals and limits for each camp.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Camp</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">Enabled</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">Cadence (Days)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">Max Reminders</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-800">
                                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/50"></td>
                                </tr>
                            ))
                        ) : camps.map(camp => (
                            <tr key={camp.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{camp.name}</div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">{camp.year} Season</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${camp.settings.reminders_enabled === 1
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {camp.settings.reminders_enabled === 1 ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {camp.settings.reminder_cadence_days}d
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {camp.settings.max_reminders}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(camp)}
                                        className="text-slate-400 hover:text-primary transition-colors"
                                        aria-label={`Edit reminder settings for ${camp.name}`}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && camps.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="text-slate-400 mb-2">
                                        <span className="material-symbols-outlined text-4xl font-light">event_busy</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white">No Camps Found</div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Create a camp to configure reminder settings.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingCamp && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-reminder-title"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 id="edit-reminder-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit Reminder Settings</h2>
                            <button onClick={() => setEditingCamp(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white mb-1">{editingCamp.name}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">{editingCamp.year} Season</div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="enabled-toggle" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">Enabled</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        id="enabled-toggle"
                                        type="checkbox"
                                        checked={editingCamp.settings.reminders_enabled === 1}
                                        onChange={e => setEditingCamp({
                                            ...editingCamp,
                                            settings: { ...editingCamp.settings, reminders_enabled: e.target.checked ? 1 : 0 }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="cadence-slider" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Cadence (Days)</label>
                                    <span className="text-sm font-mono text-primary font-bold">{editingCamp.settings.reminder_cadence_days}d</span>
                                </div>
                                <input
                                    id="cadence-slider"
                                    type="range" min="1" max="14" step="1"
                                    value={editingCamp.settings.reminder_cadence_days}
                                    onChange={e => setEditingCamp({
                                        ...editingCamp,
                                        settings: { ...editingCamp.settings, reminder_cadence_days: parseInt(e.target.value) }
                                    })}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="max-reminders-slider" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Max Reminders</label>
                                    <span className="text-sm font-mono text-primary font-bold">{editingCamp.settings.max_reminders}</span>
                                </div>
                                <input
                                    id="max-reminders-slider"
                                    type="range" min="1" max="10" step="1"
                                    value={editingCamp.settings.max_reminders}
                                    onChange={e => setEditingCamp({
                                        ...editingCamp,
                                        settings: { ...editingCamp.settings, max_reminders: parseInt(e.target.value) }
                                    })}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button onClick={() => setEditingCamp(null)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">Save Settings</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

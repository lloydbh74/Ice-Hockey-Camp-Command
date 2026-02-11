"use client";

import React, { useState, useEffect } from 'react';
import { CampDay } from '@/lib/db';

interface DayManagerProps {
    campId: number;
    onUpdate?: () => void;
}

export function DayManager({ campId, onUpdate }: DayManagerProps) {
    const [days, setDays] = useState<CampDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newLabel, setNewLabel] = useState('');

    const fetchDays = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/camps/${campId}/days`);
            if (!res.ok) throw new Error('Failed to fetch days');
            const data = await res.json();
            setDays(data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campId) fetchDays();
    }, [campId]);

    const handleAddDay = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newDate) {
            setError('Date is required');
            return;
        }

        try {
            const res = await fetch(`/api/admin/camps/${campId}/days`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newDate, label: newLabel })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create day');
            }

            setNewDate('');
            setNewLabel('');
            fetchDays();
            if (onUpdate) onUpdate();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteDay = async (dayId: number) => {
        if (!confirm('Are you sure you want to delete this day? This may archive it if sessions exist.')) return;

        try {
            const res = await fetch(`/api/admin/camps/${campId}/days/${dayId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete day');
            }

            fetchDays();
            if (onUpdate) onUpdate();
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                Manage Camp Days
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* List of Days */}
                <div className="space-y-2">
                    {days.length === 0 && !loading && (
                        <p className="text-sm text-slate-500 italic">No days defined yet.</p>
                    )}
                    {days.map((day) => (
                        <div key={day.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-800 group">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{day.label || 'Unnamed Day'}</span>
                                <span className="text-xs text-slate-500">{new Date(day.date).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteDay(day.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Delete Day"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Day Form */}
                <form onSubmit={handleAddDay} className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Add New Day</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Label (e.g. Day 1)"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white rounded px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Adding...' : (
                            <>
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add Day
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

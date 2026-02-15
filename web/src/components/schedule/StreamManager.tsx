"use client";

import React, { useState, useEffect } from 'react';
import { Stream } from '@/lib/db';

interface StreamManagerProps {
    campId: number;
    onUpdate?: () => void;
}

export function StreamManager({ campId, onUpdate }: StreamManagerProps) {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const fetchStreams = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/camps/${campId}/streams`);
            if (!res.ok) throw new Error('Failed to fetch streams');
            const data = await res.json() as any;
            setStreams(data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campId) fetchStreams();
    }, [campId]);

    const handleAddStream = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newName) {
            setError('Name is required');
            return;
        }

        try {
            const res = await fetch(`/api/admin/camps/${campId}/streams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (!res.ok) {
                const data = await res.json() as any;
                throw new Error(data.error || 'Failed to create stream');
            }

            setNewName('');
            fetchStreams();
            if (onUpdate) onUpdate();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteStream = async (streamId: number) => {
        if (!confirm('Are you sure you want to delete this stream? It may be archived if sessions are using it.')) return;

        try {
            const res = await fetch(`/api/admin/camps/${campId}/streams/${streamId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json() as any;
                throw new Error(data.error || 'Failed to delete stream');
            }

            fetchStreams();
            if (onUpdate) onUpdate();
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                Manage Streams
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* List of Streams */}
                <div className="space-y-2">
                    {streams.length === 0 && !loading && (
                        <p className="text-sm text-slate-500 italic">No streams defined yet.</p>
                    )}
                    {streams.map((stream) => (
                        <div key={stream.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-800 group">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{stream.name}</span>
                            <button
                                onClick={() => handleDeleteStream(stream.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Delete Stream"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Stream Form */}
                <form onSubmit={handleAddStream} className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Add New Stream</p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Stream Name (e.g. 9–14 Elite)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white rounded px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {loading ? 'Adding...' : (
                                <>
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

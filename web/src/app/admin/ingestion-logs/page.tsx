"use client";

export const runtime = 'edge';


import React, { useState, useEffect } from "react";
import Link from "next/link";

interface IngestionLog {
    id: number;
    raw_email_id: string;
    status: 'success' | 'failure';
    message: string;
    details: string;
    created_at: string;
}

export default function IngestionLogsPage() {
    const [logs, setLogs] = useState<IngestionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/admin/ingestion-logs", {
                headers: { 'X-Admin-Token': 'swedish-camp-admin-2026' }
            });
            if (res.ok) {
                setLogs(await res.json() as any);
            }
        } catch (e) {
            console.error("Failed to fetch ingestion logs", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Logs...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-primary">Ingestion Audit Trail</h1>
                    <p className="text-slate-500 text-sm font-medium">Monitor email ingestion attempts and failures (Spec 003)</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Refresh
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`px-2.py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${log.status === 'success'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{log.message}</div>
                                        {log.status === 'failure' && (
                                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md font-mono">
                                                {log.details}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.raw_email_id}</td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No ingestion logs found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

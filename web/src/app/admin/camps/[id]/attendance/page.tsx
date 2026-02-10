"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AttendanceRecord {
    id: number;
    playerName: string;
    dob: string;
    guardianName: string;
    productName: string;
    status: string;
    timestamp: string;
    criticalInfo: Record<string, string>;
    fullResponse: any;
}

export default function AttendanceListPage() {
    const params = useParams();
    const id = params.id;
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetch(`/api/admin/camps/${id}/attendance`)
            .then((res) => res.json())
            .then((data) => {
                setAttendance(data.results || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch attendance", err);
                setLoading(false);
            });
    }, [id]);

    const handleExport = () => {
        window.open(`/api/admin/camps/${id}/export/attendance`, '_blank');
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading Attendance...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href={`/admin/camps/${id}`} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Attendance</h1>
                    <p className="text-slate-500 font-medium">Player Registrations & Health Flags</p>
                </div>

                <button
                    onClick={handleExport}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Export CSV</span>
                </button>
            </header>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Player</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Guardian</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Critical Info</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attendance.map((row) => (
                            <React.Fragment key={row.id}>
                                <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${expandedId === row.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{row.playerName}</div>
                                        <div className="text-xs text-slate-500">{row.productName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {row.guardianName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(row.criticalInfo).length > 0 ? (
                                                Object.entries(row.criticalInfo).map(([key, value], idx) => (
                                                    <div key={idx} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded text-[10px] font-bold border border-red-100 dark:border-red-900/30">
                                                        {key}: {value}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-slate-300 dark:text-slate-700 text-xs font-medium">None noted</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                                            className="text-slate-400 hover:text-blue-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">
                                                {expandedId === row.id ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === row.id && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Object.entries(row.fullResponse).map(([key, value], idx) => (
                                                    <div key={idx}>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{String(value)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-[10px] text-slate-400 font-medium">
                                                <span>Registration ID: {row.id}</span>
                                                <span>Submitted: {new Date(row.timestamp).toLocaleString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {attendance.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                    No registrations found for this camp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

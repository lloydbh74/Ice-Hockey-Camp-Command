"use client";

export const runtime = 'edge';


import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Registration {
    id: number;
    guardian_name: string;
    guardian_email: string;
    product_name: string;
    camp_name?: string;
    amount: number;
    currency: string;
    registration_state: string;
    purchase_timestamp: string;
}

const getCurrencySymbol = (currency?: string) => {
    if (currency === 'GBP' || currency === 'SEK') return '£';
    if (currency === 'EUR') return '€';
    return '£'; // Default to GBP as per user request
};

function RegistrationsContent() {
    const searchParams = useSearchParams();
    const campId = searchParams.get('campId');
    const initialStatus = searchParams.get('status') || 'all';

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    useEffect(() => {
        const url = `/api/admin/registrations?${campId ? `campId=${campId}&` : ''}${statusFilter !== 'all' ? `status=${statusFilter}` : ''}`;

        fetch(url)
            .then((res) => res.json())
            .then((data: any) => {
                setRegistrations(data.results || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch registrations", err);
                setLoading(false);
            });
    }, [campId, statusFilter]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Registration Management</h1>
                    <p className="text-slate-500 font-medium">Manage all camp purchases and completion states.</p>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="missing">Missing / Incomplete</option>
                        <option value="invited">Invited</option>
                        <option value="uninvited">Uninvited</option>
                    </select>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Guardian</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Product / Camp</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-8">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : registrations.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{row.guardian_name}</div>
                                    <div className="text-xs text-slate-500">{row.guardian_email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.product_name}</div>
                                    {row.camp_name && <div className="text-[10px] text-slate-400 font-bold uppercase">{row.camp_name}</div>}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                    {getCurrencySymbol(row.currency)}{row.amount}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.registration_state === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {row.registration_state}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                    {new Date(row.purchase_timestamp).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {!loading && registrations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                    No registrations matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function RegistrationsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-slate-500">Loading Management Console...</div>}>
            <RegistrationsContent />
        </Suspense>
    );
}

"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

interface Registration {
    id: number;
    guardian_name: string;
    guardian_email: string;
    product_name: string;
    amount: number;
    price_at_purchase: number;
    currency: string;
    registration_state: string;
    purchase_timestamp: string;
}

interface Camp {
    id: number;
    name: string;
    year: number;
}

export default function CampDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const campId = resolvedParams.id;
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [camp, setCamp] = useState<Camp | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = { 'X-Admin-Token': 'swedish-camp-admin-2026' };
            const [campRes, regRes] = await Promise.all([
                fetch(`/api/admin/camps/${campId}`, { headers }),
                fetch(`/api/admin/camps/${campId}/registrations`, { headers })
            ]);
            if (campRes.ok) setCamp(await campRes.json());
            if (regRes.ok) setRegistrations(await regRes.json());
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</div>;
    if (!camp) return <div className="p-8 text-red-500 font-bold">Camp not found.</div>;

    const getCurrencySymbol = (currency?: string) => {
        if (currency === 'GBP') return '£';
        if (currency === 'SEK') return 'kr ';
        if (currency === 'EUR') return '€';
        return '';
    };

    const totalRevenue = registrations.reduce((sum, r) => sum + (r.amount || 0), 0);
    const mainCurrency = registrations.length > 0 ? registrations[0].currency : 'GBP';

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings/camps" className="text-slate-400 hover:text-slate-600" aria-label="Go back to camp management">
                        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{camp.name}</h1>
                        <p className="text-slate-500 text-sm font-medium">{camp.year} Registrations Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-tighter">Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Registrations</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{registrations.length}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-3xl font-black text-primary">{getCurrencySymbol(mainCurrency)}{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Fulfillment</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">--</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Participant List</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guardian</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product / Sub-Camp</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {registrations.map(reg => (
                                <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{reg.guardian_name}</td>
                                    <td className="px-6 py-4 text-slate-500">{reg.guardian_email}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{reg.product_name}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">{getCurrencySymbol(reg.currency)}{reg.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                        {new Date(reg.purchase_timestamp).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {registrations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No registrations for this camp session yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

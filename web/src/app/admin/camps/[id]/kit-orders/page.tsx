"use client";

export const runtime = 'edge';


import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface KitItem {
    itemType: string;
    orders: { size: string; quantity: number }[];
}

interface Personalization {
    playerName: string;
    jerseySize: string;
    personalization: string;
}

export default function KitOrderSummaryPage() {
    const params = useParams();
    const id = params.id;
    const [summary, setSummary] = useState<KitItem[]>([]);
    const [personalizations, setPersonalizations] = useState<Personalization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/camps/${id}/kit-orders`)
            .then((res) => res.json())
            .then((data: any) => {
                setSummary(data.summary || []);
                setPersonalizations(data.personalizations || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch kit orders", err);
                setLoading(false);
            });
    }, [id]);

    const handleExport = () => {
        window.open(`/api/admin/camps/${id}/export/kit-orders`, '_blank');
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading Kit Orders...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href={`/admin/camps/${id}`} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Kit Order Summary</h1>
                    <p className="text-slate-500 font-medium">Aggregated sizes for bulk ordering.</p>
                </div>

                <button
                    onClick={handleExport}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Export CSV</span>
                </button>
            </header>

            {summary.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-20 rounded-3xl text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">checkroom</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No kit orders found</h3>
                    <p className="text-slate-500 mt-2">Kit information is collected during registration.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {summary.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{item.itemType}</h2>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Size</th>
                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {item.orders.map((order, i) => (
                                                <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{order.size}</td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white text-lg">{order.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-bold">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total Items</span>
                                    <span className="text-slate-900 dark:text-white">
                                        {item.orders.reduce((acc, curr) => acc + curr.quantity, 0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {personalizations.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Jersey Personalizations</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Player</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Size</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Personalization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {personalizations.map((p, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{p.playerName}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.jerseySize}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-black tracking-widest uppercase">
                                                        {p.personalization || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

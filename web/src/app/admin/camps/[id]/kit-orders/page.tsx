"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface KitItem {
    itemType: string;
    orders: { size: string; quantity: number }[];
}

export default function KitOrderSummaryPage() {
    const params = useParams();
    const id = params.id;
    const [items, setItems] = useState<KitItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/camps/${id}/kit-orders`)
            .then((res) => res.json())
            .then((data: any) => {
                setItems(data);
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

            {items.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-20 rounded-3xl text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">checkroom</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No kit orders found</h3>
                    <p className="text-slate-500 mt-2">Kit information is collected during registration.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{item.itemType}</h2>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Size</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Quantity</th>
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
                                    <tfoot>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold">
                                            <td className="px-6 py-4 text-xs text-slate-500 uppercase tracking-widest">Total Items</td>
                                            <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                                                {item.orders.reduce((acc, curr) => acc + curr.quantity, 0)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

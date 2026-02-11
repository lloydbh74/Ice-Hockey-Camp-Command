"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface DashboardData {
    camp: { id: number; name: string; year: number };
    stats: {
        totalPurchases: number;
        completedRegistrations: number;
        missingRegistrations: number;
        completionPercentage: number;
    };
}

export default function CampDashboardPage() {
    const params = useParams();
    const id = params.id;
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/camps/${id}/summary`)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch dashboard data", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading Dashboard...</div>;
    if (!data) return <div className="p-8 text-red-500">Camp data not found.</div>;

    const kpis = [
        { label: "Total Purchases", value: data.stats.totalPurchases, icon: "payments", color: "blue" },
        { label: "Completed", value: data.stats.completedRegistrations, icon: "check_circle", color: "green" },
        { label: "Missing", value: data.stats.missingRegistrations, icon: "pending_actions", color: "amber" },
        { label: "Completion Rate", value: `${data.stats.completionPercentage}%`, icon: "analytics", color: "indigo" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin" className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Back to All Camps</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{data.camp.name}</h1>
                    <p className="text-slate-500 font-medium">Dashboard Overview • {data.camp.year} Season</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/admin/registrations?campId=${id}`} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">assignment</span>
                        <span>Manage Registrations</span>
                    </Link>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{kpi.value}</h3>
                            </div>
                            <div className={`size-10 rounded-xl flex items-center justify-center bg-${kpi.color}-500/10 text-${kpi.color}-500`}>
                                <span className="material-symbols-outlined">{kpi.icon}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions Card */}
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl lg:col-span-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Reports & Actions</h3>
                    <nav className="space-y-3">
                        <Link href={`/admin/camps/${id}/schedule`} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all group shadow-lg shadow-blue-500/20">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">calendar_month</span>
                                <span className="text-sm font-semibold">Camp Schedule Planner</span>
                            </div>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                        <Link href={`/admin/camps/${id}/attendance`} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors">event_available</span>
                                <span className="text-sm font-semibold">Daily Attendance</span>
                            </div>
                            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
                        </Link>
                        <Link href={`/admin/camps/${id}/kit-orders`} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors">checkroom</span>
                                <span className="text-sm font-semibold">Kit Order Summary</span>
                            </div>
                            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
                        </Link>
                        <Link href={`/admin/registrations?campId=${id}&status=missing`} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors">mail_outline</span>
                                <span className="text-sm font-semibold">Chase Registrations</span>
                            </div>
                            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
                        </Link>
                    </nav>
                </div>

                {/* Progress Chart Placeholder / Recent Log */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">insights</span>
                        <p className="text-sm font-medium">Activity feed and trends coming soon.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

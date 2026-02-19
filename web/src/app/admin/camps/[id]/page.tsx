"use client";

export const runtime = 'edge';


import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Registration {
    id: number;
    guardian_name: string;
    guardian_email: string;
    product_name: string;
    registration_state: string;
    purchase_timestamp: string;
    player_first_name?: string;
    player_last_name?: string;
}

interface DashboardData {
    camp: { id: number; name: string; year: number };
    stats: {
        totalPurchases: number;
        completedRegistrations: number;
        missingRegistrations: number;
        completionPercentage: number;
    };
    recentRegistrations: Registration[];
}

export default function CampDashboardPage() {
    const params = useParams();
    const id = params.id;
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [summaryRes, recentRes] = await Promise.all([
                    fetch(`/api/admin/camps/${id}/summary`),
                    fetch(`/api/admin/registrations?campId=${id}&limit=5`)
                ]);

                const summaryData = await summaryRes.json();
                const recentData = await recentRes.json();

                setData({
                    ...(summaryData as any),
                    recentRegistrations: (recentData as any).results || []
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [id]);

    if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading Dashboard...</div>;
    if (!data) return <div className="p-8 text-red-500">Camp data not found.</div>;

    const kpis = [
        { label: "Total Purchases", value: data.stats.totalPurchases, icon: "payments", color: "blue", href: `/admin/registrations?campId=${id}` },
        { label: "Completed", value: data.stats.completedRegistrations, icon: "check_circle", color: "green", href: `/admin/registrations?campId=${id}&status=completed` },
        { label: "Missing", value: data.stats.missingRegistrations, icon: "pending_actions", color: "amber", href: `/admin/registrations?campId=${id}&status=missing` },
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
                {kpis.map((kpi, i) => {
                    const CardContent = (
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{kpi.value}</h3>
                            </div>
                            <div className={`size-10 rounded-xl flex items-center justify-center bg-${kpi.color}-500/10 text-${kpi.color}-500`}>
                                <span className="material-symbols-outlined">{kpi.icon}</span>
                            </div>
                        </div>
                    );

                    return kpi.href ? (
                        <Link key={i} href={kpi.href} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:border-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Quick Search */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl mb-10 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Registrant Search</h3>
                    <p className="text-sm text-slate-500 font-medium">Find anyone registered for this camp by name or email.</p>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                        window.location.href = `/admin/registrations?campId=${id}&q=${encodeURIComponent(query)}`;
                    }}
                    className="w-full md:w-96 relative group"
                >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors">search</span>
                    </div>
                    <input
                        name="q"
                        type="text"
                        placeholder="Search player or guardian..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all outline-none"
                    />
                </form>
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
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Registrations</h3>
                        <Link href={`/admin/registrations?campId=${id}`} className="text-blue-600 hover:underline text-xs font-bold">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {data.recentRegistrations.length > 0 ? (
                            data.recentRegistrations.map((reg) => (
                                <div key={reg.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                            {reg.player_first_name?.[0] || reg.guardian_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {reg.player_first_name ? `${reg.player_first_name} ${reg.player_last_name}` : reg.guardian_name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {reg.product_name} • {new Date(reg.purchase_timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${reg.registration_state === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                                        {reg.registration_state}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <span className="material-symbols-outlined text-6xl mb-4">person_add</span>
                                <p className="text-sm font-medium">No registrations yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

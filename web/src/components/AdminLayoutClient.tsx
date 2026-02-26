"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen">
                {children}
            </div>
        );
    }

    return (
        <div className="flex bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen">
            {/* Sidebar: Nordic Midnight */}
            <aside aria-label="Sidebar Navigation" className="w-64 bg-nordic-midnight text-white flex flex-col shrink-0 fixed h-full z-10 border-r border-white/5">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/20" aria-hidden="true">
                        <span className="material-symbols-outlined text-white text-xl">landscape</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none tracking-tight">Swedish Camp</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Command Admin</p>
                    </div>
                </div>

                <nav className="flex-1 mt-4 px-3 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <Link href="/admin/forms/builder" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">description</span>
                        <span className="text-sm font-medium">Form Builder</span>
                    </Link>
                    <Link href="/admin/registrations" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">assignment</span>
                        <span className="text-sm font-medium">Registrations</span>
                    </Link>
                    <Link href="/admin/ingestion-logs" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">history</span>
                        <span className="text-sm font-medium">Ingestion Logs</span>
                    </Link>
                    <div className="pt-6 pb-2 px-4 uppercase text-[10px] font-bold text-slate-500 tracking-widest">Settings</div>
                    <Link href="/admin/settings/camps" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">camping</span>
                        <span className="text-sm font-medium">Camp Management</span>
                    </Link>
                    <Link href="/admin/settings/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">inventory_2</span>
                        <span className="text-sm font-medium">Product Repository</span>
                    </Link>
                    <Link href="/admin/settings/reminders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">notifications</span>
                        <span className="text-sm font-medium">Reminder Settings</span>
                    </Link>
                    <Link href="/admin/settings/system" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">settings</span>
                        <span className="text-sm font-medium">System Config</span>
                    </Link>

                    <div className="pt-6 pb-2 px-4 uppercase text-[10px] font-bold text-slate-500 tracking-widest">Help & Support</div>
                    <Link href="/admin/manual" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110" aria-hidden="true">menu_book</span>
                        <span className="text-sm font-medium">User Manual</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    {/* User Profile Stub */}
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="size-8 rounded-full bg-slate-800 border border-white/10" aria-hidden="true"></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold">Admin User</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Super Admin</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col ml-64 min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                {children}
            </main>
        </div>
    );
}

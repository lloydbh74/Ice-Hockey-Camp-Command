"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
    Home,
    LayoutDashboard,
    Users,
    Tent,
    ArrowLeftRight,
    History,
    FileText,
    Package,
    Calendar,
    BellRing,
    Settings
} from "lucide-react";

const chapters = [
    { title: "Introduction", href: "/admin/manual", icon: Home, section: "Overview" },
    { title: "Organiser Dashboard", href: "/admin/manual/dashboard", icon: LayoutDashboard, section: "Core Modules" },
    { title: "Managing Registrations", href: "/admin/manual/registrations", icon: Users, section: "Core Modules" },
    { title: "Camp Operations", href: "/admin/manual/camp-operations", icon: Tent, section: "Core Modules" },
    { title: "Data Reconciliation", href: "/admin/manual/reconciliation", icon: ArrowLeftRight, section: "Data Integrity" },
    { title: "Ingestion Logs", href: "/admin/manual/ingestion-logs", icon: History, section: "Data Integrity" },
    { title: "Form Builder", href: "/admin/manual/form-builder", icon: FileText, section: "Configuration" },
    { title: "Product Repository", href: "/admin/manual/product-repository", icon: Package, section: "Configuration" },
    { title: "Camp Management", href: "/admin/manual/camp-management", icon: Calendar, section: "Configuration" },
    { title: "Reminder Settings", href: "/admin/manual/reminder-settings", icon: BellRing, section: "Configuration" },
    { title: "System Config", href: "/admin/manual/system-settings", icon: Settings, section: "Configuration" },
];

export default function ManualLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const renderLinks = (section: string) => (
        <div className="space-y-1 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-3">{section}</h3>
            {chapters.filter(c => c.section === section).map((chapter) => {
                const isActive = pathname === chapter.href;
                const Icon = chapter.icon;
                return (
                    <Link
                        key={chapter.href}
                        href={chapter.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all group ${isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800/30"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                        {chapter.title}
                    </Link>
                );
            })}
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] md:h-screen -m-6 md:-m-8 lg:-m-10">
            {/* Secondary Sidebar: Chapters */}
            <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 overflow-y-auto shrink-0 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">User Manual</h2>
                    <p className="text-xs text-slate-500 mb-8 font-medium">Learn how to operate Camp Command effectively.</p>
                    <nav>
                        {renderLinks("Overview")}
                        {renderLinks("Core Modules")}
                        {renderLinks("Data Integrity")}
                        {renderLinks("Configuration")}
                    </nav>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 px-6 py-8 md:p-12">
                <div className="max-w-3xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

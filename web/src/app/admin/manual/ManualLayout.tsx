"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const chapters = [
    { title: "Introduction", href: "/admin/manual", icon: "home" },
    { title: "Core Concepts", href: "/admin/manual/hierarchy", icon: "account_tree" },
    { title: "Camp Setup", href: "/admin/manual/setup", icon: "add_task" },
    { title: "Forms", href: "/admin/manual/forms", icon: "description" },
    { title: "Attendees", href: "/admin/manual/attendees", icon: "group" },
    { title: "System & Emails", href: "/admin/manual/system", icon: "notifications_active" },
    { title: "Hockey Camp Sweden", href: "/admin/manual/hockey-camp-sweden", icon: "menu_book" },
];

export default function ManualLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex h-full">
            {/* Secondary Sidebar: Chapters */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-full overflow-y-auto shrink-0 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Manual Chapters</h2>
                    <nav className="space-y-1">
                        {chapters.map((chapter) => {
                            const isActive = pathname === chapter.href;
                            return (
                                <Link
                                    key={chapter.href}
                                    href={chapter.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${isActive
                                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-lg ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}>
                                        {chapter.icon}
                                    </span>
                                    {chapter.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
                <div className="max-w-4xl p-8 md:p-12">
                    {children}
                </div>
            </div>
        </div>
    );
}

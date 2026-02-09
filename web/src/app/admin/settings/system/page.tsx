"use client";

import React from "react";

export default function SystemSettingsPage() {
    return (
        <div className="max-w-5xl mx-auto px-8 py-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-4">
                <a href="#" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors">Admin</a>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-900 dark:text-slate-50 text-sm font-semibold">System Settings</span>
            </nav>

            {/* Page Header */}
            <header className="mb-10">
                <h2 className="text-[#0d161c] dark:text-white text-4xl font-black leading-tight tracking-tight mb-2">System Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">Manage camp logistics, user access controls, and core system configurations.</p>
            </header>

            <div className="flex flex-col gap-10">
                {/* Section 1: Admin Access */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-[#0d161c] dark:text-white text-xl font-bold">Admin Access</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage who has administrative control over the camp system.</p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Email Address</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">bjorn.admin@camp.se</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Owner</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <span className="size-1.5 rounded-full bg-emerald-600"></span> Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button disabled className="text-xs font-bold text-slate-400 cursor-not-allowed uppercase tracking-wide">Remove</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">astrid.manager@camp.se</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Admin</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <span className="size-1.5 rounded-full bg-emerald-600"></span> Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-700 transition-colors uppercase tracking-wide">Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Add User Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                        <form className="flex gap-3 items-end">
                            <div className="flex-1 max-w-sm">
                                <label htmlFor="new_email" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">Add New Administrator</label>
                                <input
                                    type="email"
                                    id="new_email"
                                    placeholder="email@address.se"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white"
                                />
                            </div>
                            <button type="submit" className="bg-primary hover:bg-[#c9e8fc] text-nordic-midnight font-bold py-2 px-6 rounded-lg text-sm transition-all shadow-sm">
                                Add User
                            </button>
                        </form>
                    </div>
                </section>

                {/* Section 2: SMTP Configuration */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-[#0d161c] dark:text-white text-xl font-bold">SMTP Configuration</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure email server settings for system notifications.</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-4xl">mail</span>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SMTP Host</label>
                                <input type="text" defaultValue="smtp.camp-command.se" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Port</label>
                                <input type="number" defaultValue="587" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Username</label>
                                <input type="text" defaultValue="notifications@camp-command.se" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Password</label>
                                <input type="password" defaultValue="••••••••••••" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white" />
                                <button type="button" className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button type="button" className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                Discard
                            </button>
                            <button type="submit" className="bg-nordic-midnight text-white px-8 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-nordic-midnight/10">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </section>

                {/* Background Decor */}
                <div className="mt-4 flex items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="text-center flex flex-col items-center">
                        <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Version Control</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">v2.4.1 - Stockholm Node</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

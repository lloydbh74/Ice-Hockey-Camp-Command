import React from "react";

export default function ManualIntroductionPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Getting Started</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Welcome to Swedish Camp Command</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your definitive management system for elite Swedish Ice Hockey Camps.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Platform Overview</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    Swedish Camp Command is designed to take the friction out of camp coordination. From building registration forms to managing hundreds of elite athletes, this platform provides the tools you need to run a professional operation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-primary mb-2">design_services</span>
                        <h3 className="font-bold mb-1">Dynamic Forms</h3>
                        <p className="text-sm text-slate-500">Build custom registration forms with our drag-and-drop builder.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-primary mb-2">analytics</span>
                        <h3 className="font-bold mb-1">Real-time Data</h3>
                        <p className="text-sm text-slate-500">Track registrations and revenue as they happen on your dashboard.</p>
                    </div>
                </div>
            </section>

            <section className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex gap-4">
                    <span className="material-symbols-outlined text-blue-600 mt-1">lightbulb</span>
                    <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-1 leading-none text-left">How to use this manual</h3>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            Navigate through the chapters using the menu on the left. We recommend starting with **Core Concepts** to understand how information is organized in the system.
                        </p>
                    </div>
                </div>
            </section>
        </article>
    );
}

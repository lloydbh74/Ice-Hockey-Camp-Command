import React from "react";

export default function ManualHierarchyPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">account_tree</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Concept</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Understanding the Hierarchy</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    To manage your camps effectively, it&apos;s essential to understand how data is structured in Swedish Camp Command.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">The Three Layers</h2>

                <div className="space-y-8">
                    <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined font-bold">camping</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1 leading-none text-left">1. The Camp (Organization)</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                This is the high-level umbrella for a year or a major event (e.g., &quot;CIHA Swedish Hockey Camp 2027&quot;). It holds all your settings, registrations, and forms for that specific season.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 ml-8">
                        <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined font-bold">event</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1 leading-none text-left">2. The Session (Event Dates)</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Each Camp has one or more Sessions. These represent specific dates or groups (e.g., &quot;Week 1: U15 Elite&quot;, &quot;Week 2: Goalies Only&quot;). Registrations are always tied to a Session.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 ml-16">
                        <div className="size-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined font-bold">inventory_2</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1 leading-none text-left">3. The Product (Add-ons)</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Sessions can have associated Products like Jerseys, extra meals, or shuttle services. These are selectable items within your registration forms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-12 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <h2 className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs mb-8">Data Relationship Diagram</h2>
                <div className="flex flex-col items-center">
                    <div className="px-6 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20">Camp 2027</div>
                    <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex gap-8">
                        <div className="flex flex-col items-center">
                            <div className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Session: Week 1</div>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">Jersey</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Session: Week 2</div>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">Airport Shuttle</div>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}

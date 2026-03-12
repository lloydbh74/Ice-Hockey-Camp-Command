import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, MousePointerClick } from "lucide-react";

export default function ManualDashboardPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">2. Organiser Dashboard</h1>
                <p className="text-xl text-slate-500 font-medium">Your global launchpad to jump into any active or archived event.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">System-Wide Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        The Organiser Dashboard is the main landing page for your admin interface. Rather than showing global metrics, it provides a visual directory of all your camps, allowing you to quickly jump into a specific event.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Selecting a Camp</h2>

                <div className="space-y-4 mb-8">
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200">1</div>
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Dashboard</strong> on the left menu.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200">2</div>
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Review the grid to find the specific camp you want to manage.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200">3</div>
                        <div className="w-full">
                            <p className="font-medium text-slate-700 dark:text-slate-300">Check the <strong>Status</strong> badge (<span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span> or <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Archived</span>) on the camp card.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 items-center">
                        <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-blue-600/20"><MousePointerClick className="w-4 h-4" /></div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Click anywhere on the camp card to dive directly into that specific camp's analytics and daily operations.</p>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Acts as the central starting point, ensuring you select the correct event before diving into specific attendee data, medical forms, or schedules.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}

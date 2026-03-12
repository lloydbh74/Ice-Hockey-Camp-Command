import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, BellRing, Settings, Send } from "lucide-react";

export default function ManualReminderSettingsPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">10. Reminder Settings</h1>
                <p className="text-xl text-slate-500 font-medium">Configure automated chasing of incomplete registration forms.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Instead of manually chasing parents for medical forms, Camp Command features a Daily Cron Job (an automated automated task) running at a designated time. This page configures the rules for when that robot sends emails.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Settings className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Configuring the Automation</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Settings &gt; Reminder Settings</strong> on the left menu.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Adjust the <strong>Reminder Day Intervals</strong> (comma separated list of days).</p>
                        </div>
                    </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300 mb-6">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">How Intervals Work</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        If you set the intervals to <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-blue-800 dark:text-blue-200">3, 7, 14</code>:
                        <br /><br />
                        When the system runs its daily check, it asks: "Has it been exactly 3 days since this parent bought their spot? Has it been exactly 7 days? Has it been exactly 14 days?" If the answer to any of those is yes, and they still haven't submitted the form, it sends an email.
                    </AlertDescription>
                </Alert>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Send className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Completely removes the administrative burden of tracking who has and hasn't submitted medical data, driving form completion rates up automatically.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Calendar, Tent, Users } from "lucide-react";

export default function ManualCampManagementPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">9. Camp Management</h1>
                <p className="text-xl text-slate-500 font-medium">Creating and archiving the top-level camp containers.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Before you can sell products or collect forms, you must create a "Camp". This acts as the highest-level bucket (e.g., "Swedish Summer Camp 2026") that holds all products, participants, and schedules for that specific event.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Tent className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Creating a New Camp</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Settings &gt; Camp Management</strong> on the left menu.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Click <span className="text-white bg-slate-900 px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1 mx-1">Add Camp</span>.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">3</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Provide the Camp Name and Year.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        This immediately generates a new card on your Organiser Dashboard and a dedicated Camp Dashboard for tracking revenue uniquely for this event.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Calendar className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Defining Sessions (Important)</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium mb-6">
                    If your camp has multiple sessions (e.g., Week 1 vs Week 2, or Forwards vs Defense), you must define them here.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Click <strong>Manage Sessions</strong> on your camp's row.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Add the text strings for your sessions (e.g., "Week 1", "Week 2").</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300 mb-6">
                    <Users className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">How this connects to forms</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        When you build a Registration Form and add a "Camp Session Picker" field, the dropdown list the parents see is populated by the sessions you define right here in this step.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Status & Archiving</h2>
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Toggle a camp Status between <strong>Active</strong> and <strong>Archived</strong>. Archiving it simply hides it from your main dashboard's daily view, keeping your workspace clean after an event finishes. Archives can be restored at any time.</p>
                </div>
            </section>
        </article>
    );
}

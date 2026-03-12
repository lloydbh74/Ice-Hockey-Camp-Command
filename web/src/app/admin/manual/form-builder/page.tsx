import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, FileText, Settings2, BellRing, Eye } from "lucide-react";

export default function ManualFormBuilderPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">7. Form Builder</h1>
                <p className="text-xl text-slate-500 font-medium">Design and configure the medical and registration questionnaires.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        The Form Builder is a visual tool allowing you to construct the exact data intake questionnaires that parents must fill out. Forms can be tailored differently for different camps.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <FileText className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Building a Form</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Form Builder</strong> on the left menu.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Create a New Form or select a Draft to edit.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">3</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Drag and drop fields onto the canvas Canvas. Available types:</p>
                            </div>
                            <ul className="list-disc pl-14 text-sm font-medium text-slate-600 dark:text-slate-400 space-y-1">
                                <li>Short/Long Text</li>
                                <li>Select (Dropdowns)</li>
                                <li>Radio (Single choice)</li>
                                <li>Date (for Date of Birth)</li>
                            </ul>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">4</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Once completely finalized, click <strong>Publish</strong>. (Draft forms cannot be assigned to products).</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Settings2 className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Advanced: Field Mapping</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium mb-6">
                    A form is just useless text until it is mapped. The system needs to know *what* each field means so it can calculate features properly.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Select a field on your form canvas.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Look at the <strong>System Mapping</strong> dropdown. Assign specific fields to system roles:</p>
                            </div>
                            <ul className="list-disc pl-14 text-sm font-medium text-slate-600 dark:text-slate-400 space-y-1">
                                <li>Set the First/Last name fields as `PLAYER_NAME`.</li>
                                <li>Set the Dob field as `PLAYER_DOB`.</li>
                                <li>Set the apparel field as `KIT_SIZE` or `JERSEY_SIZE`.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300 mb-6">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Without mapping `KIT_SIZE`, the system cannot generate automated Kit Order Summaries for the Camp. Without `PLAYER_NAME`, the attendance list will be blank. Mapping is critical to automation.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <BellRing className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Advanced: Flags & Highlights</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Always Show in Attendee Lists</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Check this box on a field configuration if coaches *must* see this data immediately (e.g., "Medical Conditions").</p>
                            <p className="text-sm text-slate-500 mt-2 italic">Impact: Makes this data instantly visible on the Daily Attendance page.</p>
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTitle className="text-amber-500 m-0"><span className="material-symbols-outlined text-sm align-middle mr-1">warning</span></AlertTitle>
                                <h3 className="font-bold text-slate-900 dark:text-white">Conditional Alerts</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Add rules like "If [Asthma] equals [Yes], highlight in RED".</p>
                            <p className="text-sm text-slate-500 mt-2 italic">Impact: Ensures critical safety information jumps off the screen to camp staff, severely reducing the logic required by coaches reading the forms manually.</p>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}

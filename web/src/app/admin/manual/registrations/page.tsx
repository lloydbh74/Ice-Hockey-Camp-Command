import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, MousePointerClick, Search, Filter, Pencil, Trash2, Mail, ArrowRightLeft } from "lucide-react";

export default function ManualRegistrationsPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">3. Managing Registrations</h1>
                <p className="text-xl text-slate-500 font-medium">The central hub for viewing, editing, and communicating with all your players.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        The Registrations page provides a master list of every player in the system. From here you can locate specific guardians, read medical forms, manually chase incomplete forms, and handle administrative overhead like moving a player to a different camp.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Search className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Viewing and Filtering Players</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">Navigate to <strong>Registrations</strong> on the left menu.</p>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">Use the <strong>Camp Filter</strong> <Filter className="inline w-4 h-4 mx-1 text-slate-400" /> dropdown to view players for a specific event.</p>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200">3</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">Use the <strong>Search Bar</strong> <Search className="inline w-4 h-4 mx-1 text-slate-400" /> to find specific players by their name or their guardian's email.</p>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-blue-600/20"><MousePointerClick className="w-4 h-4" /></div>
                            <p className="font-medium text-slate-900 dark:text-white mt-1">Click the <strong>Pencil icon</strong> <Pencil className="inline w-4 h-4 mx-1 text-blue-500" /> (Edit) on any row to open the registration details and view or change the full answers they submitted.</p>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Allows you to quickly locate a player's record to answer parent queries or check medical flags.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Pencil className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Editing a Registration</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Locate the player and click the <strong>Pencil icon</strong> <Pencil className="inline w-4 h-4 mx-1 text-slate-500" />.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Modify any of the text fields, dropdowns, or numbers as requested by the parent.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">3</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Click <strong>Save Registration</strong>.</p>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Keeps data accurate if a parent emails you with a correction (e.g., "I entered the wrong emergency number").
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <ArrowRightLeft className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Transferring a Player (Changing Camps)</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">1</div>
                        Open the player's <strong>Edit Modal</strong>.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">2</div>
                        Click the <strong>Transfer...</strong> button.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">3</div>
                        Select the new Camp/Product you wish to move them to.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">4</div>
                        Review the data mapped to the new form, then confirm.
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Automatically moves the player to a different group (e.g., from U14 to U15) and attempts to carry over all their matching form answers, saving the parent from having to fill out a new form.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Mail className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Manually Chasing a Form</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">If a player has a status of PENDING (they paid but didn't submit their form):</p>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">1</div>
                        Locate the player in the Registrations list.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">2</div>
                        Click the <strong>Chase Form</strong> (Mail <Mail className="inline w-3 h-3 mx-1" />) icon on their row.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">3</div>
                        Confirm the prompt to fire off a dedicated email to the guardian.
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Immediately emails the parent a unique link to complete their missing medical and player details, increasing compliance before opening day.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12 border-4 border-red-100 dark:border-red-900/30 rounded-2xl p-6 bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-center gap-3 mb-4 border-b border-red-200 dark:border-red-900/50 pb-2">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 m-0">Deleting a Registration (CAUTION)</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">1</div>
                        Locate the player in the Registrations list.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">2</div>
                        Click the <strong>Trash Can</strong> <Trash2 className="inline w-3 h-3 text-red-500 mx-1" /> icon on their row.
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 font-medium">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black shrink-0">3</div>
                        Carefully read the warning and confirm deletion.
                    </div>
                </div>

                <Alert className="bg-red-100 border-red-300 text-red-900 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Warning: Destructive Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        This entirely removes the player from the system. It does <strong>not</strong> issue a financial refund (you must do that in the external shop). This action cannot be undone. Usually only done for test records or severe cancellations.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}
import { AlertCircle } from "lucide-react";

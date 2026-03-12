import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UploadCloud, AlertCircle, ArrowLeftRight, CheckCircle2 } from "lucide-react";

export default function ManualReconciliationPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">5. Data Reconciliation</h1>
                <p className="text-xl text-slate-500 font-medium">Keeping the camp database synchronized with your external WooCommerce shop data.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Camp Command is decoupled from your main eCommerce shop to improve security and performance. However, this means order data must be synchronized. The Reconciliation tool compares an export from your shop against the Camp Command database to find discrepancies.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Uploading a Shop CSV</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Reconciliation</strong> on the left menu.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Export your orders from WooCommerce in CSV format.</p>
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-12">Ensure the CSV includes order number, status, date, billing first name, billing email, product name, and product SKU.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-200"><UploadCloud className="w-4 h-4" /></div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Click <strong>Select CSV File</strong>, grab your file, and click <strong>Analyze File</strong>.</p>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        This starts the system's cross-referencing engine. It scans thousands of orders in seconds.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Reviewing Discrepancies</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium mb-6">After analysis, the system categorizes the data into visual cards.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30 p-4 rounded-xl">
                        <h3 className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-widest flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4" /> Matches</h3>
                        <p className="text-sm text-green-900 dark:text-green-300 font-medium">Orders in the CSV that successfully match players already in Camp Command.</p>
                    </div>
                    <div className="border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30 p-4 rounded-xl">
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> Missing</h3>
                        <p className="text-sm text-amber-900 dark:text-amber-300 font-medium">Valid shop orders that are <strong>not</strong> in Camp Command. These need to be imported.</p>
                    </div>
                    <div className="border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30 p-4 rounded-xl">
                        <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> Skipped</h3>
                        <p className="text-sm text-red-900 dark:text-red-300 font-medium">Orders ignored. They are usually failed bank transfers or cancelled shop orders.</p>
                    </div>
                    <div className="border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 p-4 rounded-xl">
                        <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Info className="w-4 h-4" /> BACS/Manual</h3>
                        <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">Players existing in Camp Command who are <strong>not</strong> in the current shop export. (Often manually added).</p>
                    </div>
                </div>

                <Alert className="bg-red-100 border-red-300 text-red-900 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300 mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Warning: Conflict Detection</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        The system will throw an urgent red warning if it finds a camper who is marked as <strong>REFUNDED</strong> in the shop, but is still listed as <strong>ACTIVE</strong> in Camp Command. You must investigate these manually.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <ArrowLeftRight className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Importing Missing Data</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Scroll down to the <strong>Missing Registrations</strong> table.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Check the boxes next to the valid orders you wish to pull into Camp Command.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">3</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Click <strong>Import Selected</strong>.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        This action will create new records in the database, associate them with the correct products based on the SKU in the CSV, and immediately trigger the "Welcome" email containing the link to the registration form.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}

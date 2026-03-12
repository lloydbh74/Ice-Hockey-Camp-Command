import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Package, KeyRound, ListPlus } from "lucide-react";

export default function ManualProductRepositoryPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">8. Product Repository</h1>
                <p className="text-xl text-slate-500 font-medium">Synchronizing external shop items with internal camp logic.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        The Product Repository is where you tell Camp Command how to interpret items sold in your external shop. By matching SKUs (Stock Keeping Units), you connect a purchased spot to a specific camp and a specific medical form.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Package className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Connecting a Shop Item</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Settings &gt; Product Repository</strong> on the left menu.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Click <span className="text-white bg-slate-900 px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1 mx-1"><ListPlus className="w-3 h-3" /> Add Product</span>.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">3</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Fill in the configurations:</p>
                            </div>
                            <ul className="list-disc pl-14 text-sm font-medium text-slate-600 dark:text-slate-400 space-y-2">
                                <li><strong>Name:</strong> Your internal reference (e.g., "Week 1 - Goalies").</li>
                                <li><strong>SKU:</strong> <span className="bg-red-100 text-red-800 px-1 rounded dark:bg-red-900/30 dark:text-red-400 font-bold">CRITICAL:</span> This must exactly match the SKU in WooCommerce.</li>
                                <li><strong>Camp:</strong> Select which camp this product belongs to (e.g., "Camp Sweden 2026").</li>
                                <li><strong>Form:</strong> Select the published form these buyers should fill out.</li>
                                <li><strong>Brevo List ID:</strong> (Optional) Providing a numeric list ID will automatically add the buyer to that specific email marketing list in Brevo.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300 mb-6">
                    <KeyRound className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">The Magic of the SKU</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        When a webhook fires from WooCommerce saying "Someone bought SKU-123", Camp Command looks up "SKU-123" here. It sees it belongs to "Camp Sweden 2026", knows it requires "Medical Form A", and automatically wires everything together in the database and fires off the correct welcome email.
                    </AlertDescription>
                </Alert>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Ensures zero-touch data entry. If the SKU is wrong, the incoming webhooks will drop the data (it will show up in Ingestion Logs as "Skipped"), and the parent will not receive their welcome email.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}

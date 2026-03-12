import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, History, ShieldAlert } from "lucide-react";

export default function ManualIngestionLogsPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">6. Ingestion Logs</h1>
                <p className="text-xl text-slate-500 font-medium">Tracking data synchronisation and webhook activity.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        The Ingestion Logs provide a technical, read-only audit trail of every time data attempts to enter the Camp Command system—specifically when Webhooks from the external WooCommerce shop send data over.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <History className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Reading Webhook Audits</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Ingestion Logs</strong> on the left menu.</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">View the table of recent webhook events.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">3</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Identify the <strong>Status</strong>:</p>
                            </div>
                            <ul className="list-disc pl-14 text-sm font-medium text-slate-600 dark:text-slate-400 space-y-2">
                                <li><span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded textxs font-bold uppercase tracking-wide">Processed</span>: The webhook came in, the product matched a valid camp, and the player was added to the system automatically.</li>
                                <li><span className="text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Skipped</span>: The webhook came in, but it was for a product we don't care about (e.g., someone bought a T-Shirt, not a Camp registration).</li>
                                <li><span className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Invalid Payload</span>: The webhook format was broken.</li>
                                <li><span className="text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Error</span>: The system failed to process the data (e.g., database was down).</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300 mb-6">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Provides a diagnostic window. If a parent says "I bought a spot but never got an email," you can check the Ingestion Logs to see if the shop ever actually told Camp Command about the purchase.
                    </AlertDescription>
                </Alert>

                <Alert className="bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300">
                    <ShieldAlert className="h-5 w-5 text-slate-400" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Technical Context</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        To keep the database fast, ingestion logs are automatically purged after 30 days. Don't rely on this page as a permanent archive. Use Reconciliation if you suspect historical data is missing.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}

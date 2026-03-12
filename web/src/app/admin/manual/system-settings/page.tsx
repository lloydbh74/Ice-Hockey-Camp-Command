import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Settings, Key, Paintbrush, FlaskConical } from "lucide-react";

export default function ManualSystemSettingsPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">11. System Config</h1>
                <p className="text-xl text-slate-500 font-medium">Core system branding, test modes, and token management.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">Overview</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        System Config controls the absolute lowest-level variables in the application. It governs how the system looks to parents, how you generate tests, and secures the API endpoints.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Paintbrush className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Organization Profiling</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">1</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">Navigate to <strong>Settings &gt; System Config</strong> on the left menu.</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black shrink-0 border border-slate-200">2</div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Under <strong>Organization Profile</strong>, set the "Contact Name".</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        This changes the "From Name" on all automated emails fired by the system.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <Key className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Managing Security Tokens</h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium mb-6">
                    In the <strong>System Variables</strong> tab, you can rotate the <code>Admin System Token</code>.
                </p>

                <Alert className="bg-red-100 border-red-300 text-red-900 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300 mb-6">
                    <Info className="h-5 w-5 fill-red-900 text-red-100" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Warning</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        If you rotate this token, all webhook requests from WooCommerce will fail until you update the corresponding "Header" value inside your WooCommerce Webhook settings.
                    </AlertDescription>
                </Alert>
            </section>

            <section className="mb-12">
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                    <FlaskConical className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 m-0">Generating Test Webhooks</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4">
                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">In the <strong>Developer Tools</strong> tab, you can simulate a purchase.</p>
                        <ul className="list-disc pl-5 text-sm font-medium text-slate-600 dark:text-slate-400 space-y-2">
                            <li>Provide a Guardian Name and Email.</li>
                            <li>Provide an active Product ID (from your Product Repository).</li>
                            <li>Click <strong>Simulate Webhook</strong>.</li>
                        </ul>
                    </div>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                    <AlertDescription className="font-medium text-sm">
                        Allows you to test the entire email firing sequence and verify form rendering without having to actually use a credit card in your shop environment.
                    </AlertDescription>
                </Alert>
            </section>
        </article>
    );
}

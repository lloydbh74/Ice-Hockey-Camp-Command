import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ManualIntroductionPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">1. Introduction</h1>
                <p className="text-xl text-slate-500 font-medium">Welcome to the central nervous system for your camp operations.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">What is Camp Command?</h2>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Function</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Ice Hockey Camp Command manages everything from the moment a parent purchases a spot in your external shop, to collecting their medical forms, right down to managing the on-ice schedule and printing kit orders.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2">How to Navigate</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">The primary navigation is located on the left-hand sidebar (often called "Nordic Midnight"). From here, you can access all modules:</p>

                <div className="space-y-4">
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">1</div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-1">Core Operations</h3>
                            <p className="text-sm text-slate-500 mt-1">Dashboard, Form Builder, Registrations, Ingestion Logs, and Reconciliation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">2</div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-1">Settings</h3>
                            <p className="text-sm text-slate-500 mt-1">Camp Management, Product Repository, Reminder Settings, and System Config.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">3</div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-1">Help & Support</h3>
                            <p className="text-sm text-slate-500 mt-1">Direct access back to this User Manual.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300">
                <Info className="h-5 w-5" />
                <AlertTitle className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Impact</AlertTitle>
                <AlertDescription className="font-medium text-sm">
                    Familiarizing yourself with the navigation ensures you can quickly jump between managing broad, system-wide settings and diving deep into the daily operations of a specific camp.
                </AlertDescription>
            </Alert>
        </article>
    );
}

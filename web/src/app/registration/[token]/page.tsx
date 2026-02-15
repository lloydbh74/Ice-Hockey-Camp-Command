"use client";

import Link from "next/link";
import React, { useEffect, useState, use } from "react";
import PublicFormRenderer from "@/components/form/PublicFormRenderer";

interface RegistrationContext {
    purchase: {
        id: number;
        guardian_name: string;
        guardian_email: string;
        product_name: string;
        registration_state: string;
        quantity: number;
    };
    form: {
        id: number;
        name: string;
        schema: any[];
    };
}

export default function RegistrationPage({ params }: { params: Promise<{ token: string }> }) {
    const resolvedParams = use(params);
    const token = resolvedParams.token;

    const [context, setContext] = useState<RegistrationContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchContext();
    }, [token]);

    const fetchContext = async () => {
        try {
            const res = await fetch(`/api/registration/context/${token}`);
            const data = await res.json() as any;

            if (res.ok) {
                setContext(data);
            } else {
                setError(data.error || "Failed to load registration");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Preparing Registration...</p>
            </div>
        );
    }

    if (error || !context) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/20 text-center">
                    <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Oops! Something went wrong</h1>
                    <p className="text-slate-500 mb-6">{error || "Invalid registration link"}</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    if (context.purchase.registration_state === 'completed') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-3xl font-bold">check</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Registration Complete</h1>
                    <p className="text-slate-500 mb-6 font-medium">This registration has already been submitted for <strong>{context.purchase.product_name}</strong>. Thank you!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20">
            <div className="max-w-3xl mx-auto py-12 px-6">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        Player Registration
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Swedish Camp <br /><span className="text-primary italic">Command</span>
                    </h1>
                </div>

                {/* Info Card */}
                <div className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Session</p>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">{context.purchase.product_name}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guardian</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{context.purchase.guardian_name}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined">person_pin</span>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    <PublicFormRenderer
                        formId={context.form.id}
                        schema={context.form.schema}
                        purchaseId={context.purchase.id}
                        registrationToken={token}
                    />
                </div>

                {/* Footer Footer */}
                <div className="mt-12 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        &copy; 2026 Swedish Camp Command. All rights reserved. <br />
                        Need help? <a href="mailto:support@swedishcamp.com" className="text-primary hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

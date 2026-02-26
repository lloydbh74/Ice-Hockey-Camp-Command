import React from "react";

export default function ManualSystemPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">notifications_active</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Configuration</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">System & Emails</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Automate your communication and fine-tune your platform settings.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Automated Reminders</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                    Stay in touch with your athletes without lifting a finger. Navigate to **Settings** → **Reminder Settings** to configure automated emails.
                </p>

                <div className="space-y-6">
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex gap-4 items-center mb-2">
                            <span className="material-symbols-outlined text-primary">schedule_send</span>
                            <h3 className="font-bold text-left leading-none">Pre-Camp Reminders</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                            Sent X days before a session starts. Perfect for sharing check-in times, equipment lists, and final logistics.
                        </p>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex gap-4 items-center mb-2">
                            <span className="material-symbols-outlined text-primary">reviews</span>
                            <h3 className="font-bold text-left leading-none">Post-Camp Follow-ups</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                            Sent after a session ends. Great for surveys, sharing camp photos, or promoting the next event.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">System Config</h2>
                <p className="text-slate-700 dark:text-slate-300">
                    The **System Config** section contains advanced settings like API endpoints and security tokens.
                </p>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 flex gap-4 mt-4">
                    <span className="material-symbols-outlined text-red-600">security</span>
                    <p className="text-xs text-red-800 dark:text-red-300 italic">
                        **CAUTION**: Changing system tokens or database settings can disconnect your admin dashboard from the registration data. Only modify these if instructed by technical support.
                    </p>
                </div>
            </section>

            <section className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Need More Help?</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    If you encounter any issues not covered in this manual, please contact the Swedish Camp Command support team via the registered technical email.
                </p>
            </section>
        </article>
    );
}

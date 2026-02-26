import React from "react";

export default function ManualSetupPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">add_task</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Guide</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Camp Setup Guide</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Follow these steps to correctly initialize and launch a new camp session.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Step 1: Create the Camp</h2>
                <div className="flex gap-6 items-start mb-6">
                    <div className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                        <p className="text-slate-700 dark:text-slate-300">
                            Go to **Settings** → **Camp Management**. Click on the <span className="text-primary font-bold">+ Create New Camp</span> button. Give your camp a clear, descriptive name (e.g.,CIHA 2027 Summer Elite) and specify the season year.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Step 2: Define Your Sessions</h2>
                <div className="flex gap-6 items-start mb-6">
                    <div className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                        <p className="text-slate-700 dark:text-slate-300">
                            Once the camp is created, click on its card to open the **Camp Settings**. Here, you can add multiple **Sessions**. Each session should have:
                        </p>
                        <ul className="list-disc ml-6 mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                            <li>**Name**: e.g., Week 1 - Defensemen Specialty</li>
                            <li>**Dates**: The start and end dates of the camp week.</li>
                            <li>**Capacity**: Maximum number of athletes allowed to register.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Step 3: Connect the Form</h2>
                <div className="flex gap-6 items-start mb-6">
                    <div className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">3</div>
                    <div>
                        <p className="text-slate-700 dark:text-slate-300">
                            Navigate to the **Form Builder** to design your registration form. After publishing your form, return to the **Camp Settings** to link that form to your specific camp. This ensures when users register, the data goes to the right place.
                        </p>
                    </div>
                </div>
            </section>

            <section className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <div className="flex gap-4">
                    <span className="material-symbols-outlined text-amber-600 mt-1">warning</span>
                    <div>
                        <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-1 leading-none text-left">Pro Tip: Testing</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                            Always run a test registration yourself before sending the link to parents. This helps you catch any missing required fields or incorrect pricing in your products.
                        </p>
                    </div>
                </div>
            </section>
        </article>
    );
}

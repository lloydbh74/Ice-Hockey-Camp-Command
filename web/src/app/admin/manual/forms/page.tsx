import React from "react";

export default function ManualFormsPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">description</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Features</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Form Management</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Learn how to build and maintain high-converting registration forms for your camps.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">The Form Builder</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    Our Form Builder is a visual tool that allows you to add, reorder, and configure registration fields without writing code. Access it via the **Form Builder** link in the main sidebar.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-2 text-left">Field Types</h3>
                        <ul className="text-xs text-slate-500 space-y-1">
                            <li>**Short Text**: For names, emails, etc.</li>
                            <li>**Number**: For ages or years of experience.</li>
                            <li>**Select/Radio**: For choosing shirt sizes or sessions.</li>
                            <li>**Checkbox**: For waivers or multiple choice items.</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-2 text-left">Validation</h3>
                        <p className="text-xs text-slate-500">
                            Each field can be marked as **Required**. You can also set custom validation rules like "Must be a valid email" or "Years of experience must be between 1 and 20".
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Active vs Draft</h2>
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                    <span className="material-symbols-outlined text-green-600">publish</span>
                    <div>
                        <p className="text-sm text-green-900 dark:text-green-300">
                            Forms in **Draft** state are only visible to admins. Once you are happy with your form, click **Publish**. This makes it available to be linked to your camps. Note: Significant structural changes to a Published form may affect existing registration data.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Mapping Data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    When you add a "Session Selection" field to your form, the system automatically maps the user's choice to the sessions you defined in **Camp Management**. This is the "magic" that keeps your registration data perfectly organized.
                </p>
            </section>
        </article>
    );
}

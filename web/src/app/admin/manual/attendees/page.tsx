import React from "react";

export default function ManualAttendeesPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Operation</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Attendee Management</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Manage your athletes, process adjustments, and keep your roster up-to-date.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">The Registrations Table</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    The **Registrations** page is your central hub for attendee data. Here you can:
                </p>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-1 text-left">Search & Filter</h3>
                        <p className="text-xs text-slate-500">
                            Use the search bar to find athletes by name, email, or jersey size. Filter by Camp or Session to generate specific rosters.
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-1 text-left">Editing Details</h3>
                        <p className="text-xs text-slate-500">
                            Mistakes happen. Click the **Edit** button on any registration to update personal info, change their assigned session, or add missing product selections.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Exporting Data</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    Need a physical roster for the coaches or a CSV for the travel team? Click the **Export CSV** button on the registrations page. This will download a file containing all currently filtered registrations.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 flex gap-4">
                    <span className="material-symbols-outlined text-blue-600">info</span>
                    <p className="text-xs text-blue-800 dark:text-blue-300 italic">
                        The export includes all custom form fields, personal info, and product selections (like Jersey size).
                    </p>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Registration Status</h2>
                <p className="text-slate-700 dark:text-slate-300">
                    Each registration is marked as **Confirmed** or **Pending**. You can manually toggle these statuses if you are handling payments offline.
                </p>
            </section>
        </article>
    );
}

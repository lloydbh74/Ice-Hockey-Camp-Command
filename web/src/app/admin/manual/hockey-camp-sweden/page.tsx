import React from "react";

export default function HockeyCampSwedenSetupPage() {
    return (
        <article className="prose prose-slate dark:prose-invert max-w-none">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">menu_book</span>
                    <span className="text-sm font-bold uppercase tracking-wider">Specific Guide</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Hockey Camp Sweden Setup</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Step-by-step instructions for configuring the multi-stream &quot;Hockey Camp Sweden&quot; instance.
                </p>
            </header>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Prerequisites</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                        <li>You must be logged into the <strong>Administrator Dashboard</strong>.</li>
                        <li>Registration Form Templates must already be published if they require specific intake data (e.g., liability waivers, emergency contacts).</li>
                    </ul>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Phase 1: Defining Global Products</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    Before a camp can accept registrations, its specific streams (products) must exist in the global repository. We will create five products: <em>Advanced Elite</em>, <em>Advanced Pro</em>, <em>Nylander Group</em>, <em>Kempe Group</em>, and <em>Adults Mixed</em>.
                </p>

                <ol className="list-decimal ml-6 mt-2 text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                    <li>Navigate to the <strong>Product Repository</strong> using the main sidebar (<code>/admin/settings/products</code>).</li>
                    <li>Click the <strong>+ Define New Product</strong> button in the top right corner.</li>
                    <li>In the modal, fill out the details for the first product:
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Product Name</strong>: <code>Advanced Elite (2008-2011)</code></li>
                            <li><strong>Description</strong>: <code>Dates: 23rd–25th August</code></li>
                            <li><strong>Product SKU</strong>: Provide a unique identifier, e.g., <code>HCS-ADV-ELITE</code></li>
                            <li><strong>Base Price (GBP)</strong>: Enter the standard price for this group.</li>
                            <li><strong>Registration Form</strong>: Select the appropriate intake form for minors.</li>
                        </ul>
                    </li>
                    <li>Click <strong>Save Product</strong>.</li>
                    <li>Repeat steps 2-4 for the remaining four groups:
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Advanced Pro (2011-2015)</strong>: <code>Dates: 23rd–25th August</code> / SKU: <code>HCS-ADV-PRO</code></li>
                            <li><strong>Nylander Group (2011-2017)</strong>: <code>Dates: 26th–28th August</code> / SKU: <code>HCS-NYLANDER</code></li>
                            <li><strong>Kempe Group (2014-2019)</strong>: <code>Dates: 26th–28th August</code> / SKU: <code>HCS-KEMPE</code></li>
                            <li><strong>Adults Mixed</strong>: <code>Dates: 22nd August (3:30 pm registration). Recommended 1 year playing experience.</code> / SKU: <code>HCS-ADULT</code></li>
                        </ul>
                    </li>
                </ol>

                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <span className="material-symbols-outlined text-blue-600">lightbulb</span>
                    <div>
                        <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">Pro Tip</p>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            Defining these products globally allows them to be reused and analyzed across different years or seasons without re-entering the data.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Phase 2: Creating the Camp Container</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    The &quot;Camp Container&quot; is the parent entity that groups these specific products together under a single banner and season.
                </p>

                <ol className="list-decimal ml-6 mt-2 text-slate-600 dark:text-slate-400 space-y-2">
                    <li>Navigate to <strong>Camp Management</strong> using the sidebar (<code>/admin/settings/camps</code>).</li>
                    <li>Click the <strong>+ Create New Camp</strong> button.</li>
                    <li>In the modal dialog:
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Camp Name</strong>: Enter <code>Hockey Camp Sweden</code></li>
                            <li><strong>Year</strong>: Ensure the current or upcoming season year is selected (e.g., <code>2024</code>).</li>
                        </ul>
                    </li>
                    <li>Click the <strong>Create Camp</strong> button.</li>
                    <li>You will now see the new camp listed. It will be marked with a grey <code>DEACTIVATED</code> badge by default.</li>
                </ol>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Phase 3: Allocating Products to the Camp</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    Now that the camp exists, we must assign our newly created streams (products) to it.
                </p>

                <ol className="list-decimal ml-6 mt-2 text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                    <li>From the <strong>Camp Management</strong> page, locate &quot;Hockey Camp Sweden&quot; and click the dark <strong>Edit Settings</strong> button on its card.</li>
                    <li>In the <strong>Camp Actions / Assigned Products</strong> view, locate the <strong>+ Add Product</strong> button.</li>
                    <li>In the modal dialog:
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Use the <strong>Select Product</strong> dropdown to find and select <code>Advanced Elite (2008-2011)</code>.</li>
                            <li>The system will automatically populate the base price. If you want to charge a different price specifically for this camp, update the <strong>Override Camp Price (GBP)</strong> field.</li>
                        </ul>
                    </li>
                    <li>Click <strong>Assign to Camp</strong>.</li>
                    <li>Repeat steps 2-4 to assign the remaining four products (<em>Advanced Pro</em>, <em>Nylander Group</em>, <em>Kempe Group</em>, <em>Adults Mixed</em>).</li>
                </ol>

                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-slate-500">info</span>
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            All assigned products will now appear under the &quot;Assigned Products&quot; list. You can click the Edit (pencil) icon next to their prices to update them at any time.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-left">Phase 4: Activation & Verification</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    The final step is to make the camp live so that the registration system can process sign-ups for these specific streams.
                </p>

                <ol className="list-decimal ml-6 mt-2 text-slate-600 dark:text-slate-400 space-y-2">
                    <li>On the Camp Settings page (<code>/admin/settings/camps/[id]</code>), look at the header next to the camp name (&quot;Hockey Camp Sweden&quot;).</li>
                    <li>Click the grey <strong>Deactivated</strong> badge.</li>
                    <li>The badge will turn green and display <strong>Active</strong>.</li>
                    <li>The setup is complete. You can now direct participants to the public registration link to select their preferred group.</li>
                </ol>
            </section>
        </article>
    );
}

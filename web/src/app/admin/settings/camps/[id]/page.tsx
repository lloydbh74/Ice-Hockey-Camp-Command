"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useCampData } from "@/hooks/useCampData";

export default function CampDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const campId = resolvedParams.id;
    const {
        camp,
        campProducts,
        allProducts,
        settings,
        setSettings,
        loading,
        saveSettings,
        addProduct: addProductToCamp,
        removeProduct: removeFromCamp
    } = useCampData(campId);

    const [showAddProduct, setShowAddProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({ id: 0, price: 0 });

    const handleSaveSettings = async () => {
        const success = await saveSettings(settings);
        if (success) alert("Settings saved!");
    };

    const handleAddProduct = async () => {
        if (!selectedProduct.id) return;
        try {
            await addProductToCamp(selectedProduct.id, selectedProduct.price);
            setShowAddProduct(false);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleRemoveProduct = async (cpId: number) => {
        if (!confirm("Remove this product from the camp?")) return;
        try {
            await removeFromCamp(cpId);
        } catch (e: any) {
            alert(e.message);
        }
    };


    if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing with Swedish Command...</div>;
    if (!camp) return <div className="p-8 text-red-500 font-bold">Camp not found.</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/camps" className="text-slate-400 hover:text-slate-600" aria-label="Go back to camp management">
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{camp.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{camp.year} SEASON</span>
                        <span className="size-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-tighter">Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Products Allocation */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Assigned Products</h2>
                            <button
                                onClick={() => setShowAddProduct(true)}
                                className="text-primary hover:text-primary-dark font-bold text-xs flex items-center gap-1"
                                aria-haspopup="dialog"
                            >
                                <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span> Add Product
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {campProducts.map(cp => (
                                <div key={cp.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500" aria-hidden="true">
                                            <span className="material-symbols-outlined">inventory_2</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{cp.product_name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Product</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">£{cp.price.toLocaleString()} GBP</div>
                                        <button
                                            onClick={() => handleRemoveProduct(cp.id)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors mt-1"
                                            aria-label={`Remove ${cp.product_name} from camp`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {campProducts.length === 0 && (
                                <div className="p-12 text-center text-slate-400 italic text-sm">No products associated with this camp yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Reminder Configuration */}
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-white/5">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-60">Reminder Engine</h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label htmlFor="reminders-toggle" className="text-sm font-bold cursor-pointer">Enabled</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        id="reminders-toggle"
                                        type="checkbox"
                                        checked={settings.remindersEnabled}
                                        onChange={e => setSettings({ ...settings, remindersEnabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="reminder-cadence" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cadence (Days)</label>
                                    <span className="text-sm font-mono text-primary font-bold">{settings.reminderCadenceDays}d</span>
                                </div>
                                <input
                                    id="reminder-cadence"
                                    type="range" min="1" max="14" step="1"
                                    value={settings.reminderCadenceDays}
                                    onChange={e => setSettings({ ...settings, reminderCadenceDays: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="max-reminders" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Reminders</label>
                                    <span className="text-sm font-mono text-primary font-bold">{settings.maxReminders}</span>
                                </div>
                                <input
                                    id="max-reminders"
                                    type="range" min="1" max="10" step="1"
                                    value={settings.maxReminders}
                                    onChange={e => setSettings({ ...settings, maxReminders: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                className="w-full py-4 bg-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all"
                            >
                                Deploy Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showAddProduct && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-product-title"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 id="add-product-title" className="text-lg font-bold text-slate-900 dark:text-white">Add Product to Camp</h2>
                            <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="select-product" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Select Product</label>
                                <select
                                    id="select-product"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all dark:text-slate-100"
                                    value={selectedProduct.id}
                                    onChange={e => {
                                        const id = parseInt(e.target.value);
                                        const prod = allProducts.find(p => p.id === id);
                                        setSelectedProduct({ id, price: prod?.base_price || 0 });
                                    }}
                                >
                                    <option value="0">Choose from Repository...</option>
                                    {allProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (£{p.base_price.toLocaleString()} GBP)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="override-price" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Override Camp Price (GBP)</label>
                                <input
                                    id="override-price"
                                    type="number"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all font-mono dark:text-slate-100"
                                    value={selectedProduct.price}
                                    onChange={e => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button onClick={() => setShowAddProduct(false)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button
                                onClick={handleAddProduct}
                                className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                            >
                                Assign to Camp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

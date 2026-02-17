"use client";

export const runtime = 'edge';


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
        updateProduct: updateCampProduct,
        removeProduct: removeFromCamp,
        toggleStatus,
        forceDeactivate,
        deleteCamp,
        archiveCamp
    } = useCampData(campId);

    const [showAddProduct, setShowAddProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({ id: 0, price: 0 });

    // Edit Product State
    const [editingProduct, setEditingProduct] = useState<{ cpId: number; name: string; price: number } | null>(null);

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

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;
        try {
            await updateCampProduct(editingProduct.cpId, editingProduct.price);
            setEditingProduct(null);
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

    const handleStatusChange = async () => {
        if (!camp) return;
        const newStatus = camp.status === 'active' ? 'deactivated' : 'active';
        try {
            await toggleStatus(newStatus);
        } catch (e: any) {
            if (e.confirmationRequired) {
                if (confirm(`${e.message}\n\nDo you want to FORCE deactivate?`)) {
                    try {
                        await forceDeactivate();
                    } catch (err: any) {
                        alert(err.message);
                    }
                }
            } else {
                alert(e.message);
            }
        }
    };


    const handleDeleteCamp = async () => {
        if (!confirm("ARE YOU SURE?\n\nThis will permanently delete the camp and its product associations.\n\nThis action cannot be undone.")) return;
        try {
            await deleteCamp();
            // Redirect to camp list
            window.location.href = '/admin/settings/camps';
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleArchiveCamp = async () => {
        if (!confirm("Available for camps with history.\n\nThis will hide the camp from main lists but preserve all data.\n\nProceed to Archive?")) return;
        try {
            await archiveCamp();
            window.location.href = '/admin/settings/camps';
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
                        <button
                            onClick={handleStatusChange}
                            className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-tighter transition-colors ${camp.status === 'active'
                                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                }`}
                        >
                            {camp.status === 'active' ? 'Active' : 'Deactivated'}
                        </button>
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
                                        <div className="flex items-center gap-2 justify-end">
                                            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">£{cp.price.toLocaleString()} GBP</div>
                                            <button
                                                onClick={() => setEditingProduct({ cpId: cp.id, name: cp.product_name, price: cp.price })}
                                                className="text-slate-400 hover:text-primary transition-colors"
                                                aria-label={`Edit price for ${cp.product_name}`}
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        </div>
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


                {/* Right Column: Camp Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-white/5">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-60">Camp Actions</h2>

                        <div className="space-y-4">
                            {/* Schedule Button */}
                            <Link
                                href={`/admin/camps/${campId}/schedule`}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white border border-blue-400/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <span className="material-symbols-outlined text-sm">calendar_month</span>
                                Camp Schedule
                            </Link>
                            {camp.purchase_count && camp.purchase_count > 0 ? (
                                <>
                                    <button
                                        onClick={handleArchiveCamp}
                                        className="w-full py-3 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">archive</span>
                                        Archive Camp
                                    </button>
                                    <p className="text-[10px] text-slate-400 text-center opacity-60">
                                        {camp.purchase_count} purchases found. Deletion disabled.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleDeleteCamp}
                                        className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Delete Camp
                                    </button>
                                    <p className="text-[10px] text-slate-400 text-center opacity-60">
                                        Safe to delete (0 purchases).
                                    </p>
                                </>
                            )}
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
            )
            }

            {
                editingProduct && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-product-title"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 id="edit-product-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit Product Price</h2>
                                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                                    <span className="material-symbols-outlined" aria-hidden="true">close</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Product</label>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{editingProduct.name}</div>
                                </div>
                                <div>
                                    <label htmlFor="edit-price" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Price (GBP)</label>
                                    <input
                                        id="edit-price"
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all font-mono dark:text-slate-100"
                                        value={editingProduct.price}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button onClick={() => setEditingProduct(null)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button
                                    onClick={handleUpdateProduct}
                                    className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                >
                                    Update Price
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

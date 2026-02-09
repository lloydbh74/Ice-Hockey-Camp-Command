"use client";

import React, { useState, useEffect } from "react";

interface Product {
    id: number;
    name: string;
    description?: string;
    base_price: number;
    status: string;
    form_template_id?: number;
}

export default function ProductRepositoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", basePrice: 0 });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products", {
                headers: { 'X-Admin-Token': 'swedish-camp-admin-2026' }
            });
            if (!res.ok) {
                const errorData: any = await res.json();
                throw new Error(errorData.error || "Failed to fetch products");
            }
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (e: any) {
            console.error("Failed to fetch products", e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': 'swedish-camp-admin-2026'
                },
                body: JSON.stringify(newProduct),
            });
            if (res.ok) {
                setShowCreateModal(false);
                fetchProducts();
            }
        } catch (e) {
            console.error("Failed to create product", e);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Repository</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage reusable products and base pricing models.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                    aria-haspopup="dialog"
                >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                    Define New Product
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Product Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-right">Base Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Linked Template</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse border-b border-slate-100">
                                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50"></td>
                                </tr>
                            ))
                        ) : products.map(product => (
                            <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{product.name}</div>
                                    {product.description && <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{product.description}</div>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">£{product.base_price.toLocaleString()} GBP</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-lg" aria-hidden="true">description</span>
                                        <span className="text-xs font-medium text-slate-600">{product.form_template_id ? `Template #${product.form_template_id}` : 'None Linked'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase tracking-tighter">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-primary transition-colors" aria-label={`Edit ${product.name}`}>
                                        <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="text-slate-400 mb-2" aria-hidden="true">
                                        <span className="material-symbols-outlined text-4xl font-light">inventory_2</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white">No Products Defined</div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">Create reusable categories for your camp offerings here before assigning them to specific seasons.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="product-modal-title"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 id="product-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Define Global Product</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="prod-name" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Product Name</label>
                                <input
                                    id="prod-name"
                                    type="text"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    placeholder="e.g. Goalie Special Session"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="prod-desc" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Description (Optional)</label>
                                <textarea
                                    id="prod-desc"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all resize-none h-20 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    placeholder="What is included...?"
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="prod-price" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Base Price (GBP)</label>
                                <input
                                    id="prod-price"
                                    type="number"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all font-mono dark:text-slate-100"
                                    value={newProduct.basePrice}
                                    onChange={e => setNewProduct({ ...newProduct, basePrice: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">Save Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

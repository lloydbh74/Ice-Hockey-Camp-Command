"use client";

export const runtime = 'edge';


import React, { useState, useEffect } from "react";

interface Product {
    id: number;
    name: string;
    sku?: string;
    description?: string;
    base_price: number;
    status: string;
    form_template_id?: number;
}

interface FormTemplate {
    id: number;
    name: string;
    description?: string;
}

export default function ProductRepositoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", sku: "", description: "", basePrice: 0, form_template_id: undefined as number | undefined });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchFormTemplates();
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
            const data = await res.json() as any;
            setProducts(Array.isArray(data) ? data : []);
        } catch (e: any) {
            console.error("Failed to fetch products", e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFormTemplates = async () => {
        try {
            const res = await fetch("/api/admin/forms", {
                headers: { 'X-Admin-Token': 'swedish-camp-admin-2026' }
            });
            if (res.ok) {
                const data = await res.json() as any;
                setFormTemplates(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Failed to fetch forms", e);
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
                body: JSON.stringify({
                    name: newProduct.name,
                    sku: newProduct.sku,
                    description: newProduct.description,
                    base_price: newProduct.basePrice,
                    form_template_id: newProduct.form_template_id
                }),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewProduct({ name: "", sku: "", description: "", basePrice: 0, form_template_id: undefined });
                fetchProducts();
            } else {
                const errorData = await res.json() as any;
                alert(`Failed to create product: ${errorData.error || 'Unknown error'}`);
            }
        } catch (e: any) {
            console.error("Failed to create product", e);
            alert(`Failed to create product: ${e.message}`);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!editingProduct) return;
        try {
            const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': 'swedish-camp-admin-2026'
                },
                body: JSON.stringify({
                    name: editingProduct.name,
                    sku: editingProduct.sku,
                    description: editingProduct.description,
                    base_price: editingProduct.base_price,
                    form_template_id: editingProduct.form_template_id
                }),
            });
            if (res.ok) {
                setShowEditModal(false);
                setEditingProduct(null);
                fetchProducts();
            } else {
                const errorData = await res.json() as any;
                alert(`Failed to update product: ${errorData.error || 'Unknown error'}`);
            }
        } catch (e: any) {
            console.error("Failed to update product", e);
            alert(`Failed to update product: ${e.message}`);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Delete "${product.name}"?\n\nThis action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: "DELETE",
                headers: { 'X-Admin-Token': 'swedish-camp-admin-2026' }
            });
            if (res.ok) {
                fetchProducts();
            } else {
                const errorData = await res.json() as any;
                alert(errorData.error || 'Failed to delete product');
            }
        } catch (e: any) {
            console.error("Failed to delete product", e);
            alert(`Failed to delete product: ${e.message}`);
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
                            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">SKU</th>
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
                                <td className="px-6 py-4 text-center">
                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                                        {product.sku || '---'}
                                    </span>
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
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-slate-400 hover:text-primary transition-colors"
                                            aria-label={`Edit ${product.name}`}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                            aria-label={`Delete ${product.name}`}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                                        </button>
                                    </div>
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

            {showEditModal && editingProduct && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-product-modal-title"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 id="edit-product-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit Product</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="edit-prod-name" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Product Name</label>
                                <input
                                    id="edit-prod-name"
                                    type="text"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-prod-desc" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Description (Optional)</label>
                                <textarea
                                    id="edit-prod-desc"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all resize-none h-20 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    value={editingProduct.description || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-prod-sku" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Product SKU (for Ingestion)</label>
                                <input
                                    id="edit-prod-sku"
                                    type="text"
                                    placeholder="e.g. CIHA-S-W1-2026"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all font-mono dark:text-slate-100 dark:placeholder:text-slate-500"
                                    value={editingProduct.sku || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-prod-price" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Base Price (GBP)</label>
                                <input
                                    id="edit-prod-price"
                                    type="number"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all font-mono dark:text-slate-100"
                                    value={editingProduct.base_price}
                                    onChange={e => setEditingProduct({ ...editingProduct, base_price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-form-template" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Registration Form (Optional)</label>
                                <select
                                    id="edit-form-template"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all dark:text-slate-100"
                                    value={editingProduct.form_template_id || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, form_template_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                >
                                    <option value="">No Form</option>
                                    {formTemplates.map(template => (
                                        <option key={template.id} value={template.id}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleUpdate} className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">Update Product</button>
                        </div>
                    </div>
                </div>
            )}

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
                                <label htmlFor="prod-sku" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Product SKU (for Ingestion)</label>
                                <input
                                    id="prod-sku"
                                    type="text"
                                    placeholder="e.g. CIHA-S-W1-2026"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all font-mono dark:text-slate-100 dark:placeholder:text-slate-500"
                                    value={newProduct.sku}
                                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
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
                            <div>
                                <label htmlFor="form-template" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Registration Form (Optional)</label>
                                <select
                                    id="form-template"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all dark:text-slate-100"
                                    value={newProduct.form_template_id || ''}
                                    onChange={e => setNewProduct({ ...newProduct, form_template_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                >
                                    <option value="">No Form</option>
                                    {formTemplates.map(template => (
                                        <option key={template.id} value={template.id}>{template.name}</option>
                                    ))}
                                </select>
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

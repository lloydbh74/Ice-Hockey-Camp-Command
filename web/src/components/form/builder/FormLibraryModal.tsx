
import React, { useEffect, useState } from 'react';

interface FormSummary {
    id: number;
    name: string;
    version: string;
    updated_at?: string;
    is_active?: number;
}

interface FormLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: number) => void;
}

export default function FormLibraryModal({ isOpen, onClose, onSelect }: FormLibraryModalProps) {
    const [forms, setForms] = useState<FormSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    useEffect(() => {
        if (isOpen) {
            loadForms();
        }
    }, [isOpen]);

    async function loadForms() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/forms', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setForms(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to load forms", error);
        } finally {
            setLoading(false);
        }
    }

    const handleArchive = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to archive this form?")) return;

        try {
            const res = await fetch(`/api/admin/forms/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadForms();
            } else {
                alert("Failed to archive form.");
            }
        } catch (error) {
            console.error("Archive failed", error);
        }
    };

    const handleRestore = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/admin/forms/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: 1 })
            });
            if (res.ok) {
                loadForms();
            } else {
                alert("Failed to restore form.");
            }
        } catch (error) {
            console.error("Restore failed", error);
        }
    };

    if (!isOpen) return null;

    // Filter forms based on tab
    // Default to active if is_active is missing (backward compatibility)
    const displayedForms = forms.filter(f =>
        activeTab === 'active'
            ? (f.is_active !== 0)
            : (f.is_active === 0)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-[600px] max-w-[90vw] flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Form Library</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'active' ? 'text-primary border-b-2 border-primary bg-blue-50/50 dark:bg-primary/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        Active Forms
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'archived' ? 'text-slate-800 dark:text-slate-200 border-b-2 border-slate-600 dark:border-slate-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        Archived
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            Loading...
                        </div>
                    ) : displayedForms.length === 0 ? (
                        <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">{activeTab === 'archived' ? 'inventory_2' : 'folder_off'}</span>
                            <p>No {activeTab} forms found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {displayedForms.map((form) => (
                                <div
                                    key={form.id}
                                    onClick={() => onSelect(form.id)}
                                    className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary dark:hover:border-primary hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeTab === 'archived' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-blue-50 dark:bg-primary/10 text-primary'}`}>
                                            <span className="material-symbols-outlined">{activeTab === 'archived' ? 'inventory_2' : 'description'}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800 dark:text-slate-200 leading-tight">{form.name}</div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                                <span className="px-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-mono">v{form.version}</span>
                                                {form.updated_at ? <span>• Updated {new Date(form.updated_at).toLocaleDateString()}</span> : ''}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {activeTab === 'active' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`/register/${form.id}`, '_blank');
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                Test Form
                                            </button>
                                        )}
                                        {activeTab === 'active' ? (
                                            <>
                                                <button
                                                    onClick={(e) => handleArchive(e, form.id)}
                                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Archive Form"
                                                >
                                                    <span className="material-symbols-outlined">archive</span>
                                                </button>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
                                            </>
                                        ) : (
                                            <button
                                                onClick={(e) => handleRestore(e, form.id)}
                                                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                title="Restore to Active"
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

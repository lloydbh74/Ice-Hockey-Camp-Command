"use client";

export const runtime = 'edge';

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Registration {
    id: number;
    guardian_name: string;
    guardian_email: string;
    product_name: string;
    camp_name?: string;
    amount: number;
    currency: string;
    registration_state: string;
    purchase_timestamp: string;
    player_first_name?: string;
    player_last_name?: string;
    registration_data?: string;
    registration_token?: string;
    schema_json?: string;
    highlighted_answers?: Record<string, string>;
}

const getCurrencySymbol = (currency?: string) => {
    if (currency === 'GBP' || currency === 'SEK') return '£';
    if (currency === 'EUR') return '€';
    return '£'; // Default to GBP as per user request
};

function RegistrationsContent() {
    const searchParams = useSearchParams();
    const urlCampId = searchParams.get('campId');
    const initialStatus = searchParams.get('status') || 'all';
    const initialQuery = searchParams.get('q') || '';

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [camps, setCamps] = useState<any[]>([]);
    const [selectedCampFilter, setSelectedCampFilter] = useState(urlCampId || 'all');
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [chaseLoading, setChaseLoading] = useState<Record<number, boolean>>({});
    const [bulkChaseLoading, setBulkChaseLoading] = useState(false);

    // Add Registration State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRegProducts, setNewRegProducts] = useState<any[]>([]);
    const [newRegData, setNewRegData] = useState({ guardianName: '', guardianEmail: '', campId: '', productId: '' });
    const [isSubmittingNewReg, setIsSubmittingNewReg] = useState(false);

    useEffect(() => {
        fetch('/api/admin/camps').then(res => res.json()).then((data: any) => setCamps(data.results || []));
    }, []);

    const handleCampChange = async (campId: string) => {
        setNewRegData({ ...newRegData, campId, productId: '' });
        if (campId) {
            const res = await fetch(`/api/admin/camps/${campId}/products`);
            if (res.ok) {
                const data = await res.json() as any;
                setNewRegProducts(data.results || []);
            }
        } else {
            setNewRegProducts([]);
        }
    };

    const handleSubmitNewReg = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingNewReg(true);
        try {
            const res = await fetch('/api/admin/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRegData)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewRegData({ guardianName: '', guardianEmail: '', campId: '', productId: '' });
                fetchRegistrations();
            } else {
                const err = await res.json() as any;
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            alert('Failed to add registration');
        } finally {
            setIsSubmittingNewReg(false);
        }
    };

    const fetchRegistrations = () => {
        setLoading(true);
        const urlCampIdParam = selectedCampFilter !== 'all' ? `campId=${selectedCampFilter}&` : '';
        const url = `/api/admin/registrations?${urlCampIdParam}${statusFilter !== 'all' && statusFilter !== 'medical' ? `status=${statusFilter}&` : ''}${searchQuery ? `q=${encodeURIComponent(searchQuery)}` : ''}`;

        fetch(url)
            .then((res) => res.json())
            .then((data: any) => {
                let results = data.results || [];

                // Client-side highlights filter if selected
                if (statusFilter === 'important') {
                    results = results.filter((r: Registration) => Object.keys(r.highlighted_answers || {}).length > 0);
                }

                setRegistrations(results);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch registrations", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRegistrations();
        }, 300); // Simple debounce
        return () => clearTimeout(timer);
    }, [selectedCampFilter, statusFilter, searchQuery]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRegistration) return;

        setSaveLoading(true);
        try {
            const formData = editingRegistration.registration_data ? JSON.parse(editingRegistration.registration_data) : {};

            const res = await fetch('/api/admin/registrations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchaseId: editingRegistration.id,
                    registration_state: editingRegistration.registration_state,
                    player: {
                        first_name: editingRegistration.player_first_name || '',
                        last_name: editingRegistration.player_last_name || '',
                        date_of_birth: formData.dob || '', // Use form data as source for DOB if synced
                        sex: formData.sex || ''
                    },
                    form_response_json: editingRegistration.registration_data
                })
            });

            if (res.ok) {
                setEditingRegistration(null);
                fetchRegistrations();
            } else {
                const errorData = await res.json() as { error?: string };
                alert(`Error: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update registration");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteRegistration = async () => {
        if (!editingRegistration) return;
        if (!confirm(`Are you sure you want to PERMANENTLY delete this registration for ${editingRegistration.guardian_name}?\n\nThis action cannot be undone and will remove all associated player details.`)) return;

        setSaveLoading(true);
        try {
            const res = await fetch(`/api/admin/registrations?purchaseId=${editingRegistration.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setEditingRegistration(null);
                fetchRegistrations();
            } else {
                const errorData = await res.json() as { error?: string };
                alert(`Error: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete registration");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleChase = async (ids: number[]) => {
        const isBulk = ids.length > 1;
        if (isBulk) setBulkChaseLoading(true);
        else setChaseLoading(prev => ({ ...prev, [ids[0]]: true }));

        try {
            const res = await fetch('/api/admin/registrations/chase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purchaseIds: ids })
            });

            if (res.ok) {
                const data = await res.json() as any;
                if (isBulk) {
                    alert(`Successfully sent ${data.summary.success} reminders. ${data.summary.failures} failed.`);
                } else {
                    alert("Reminder sent successfully!");
                }
                // Refresh to show status changes
                fetchRegistrations();
            } else {
                alert("Failed to send reminders");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while chasing registrations");
        } finally {
            if (isBulk) setBulkChaseLoading(false);
            else setChaseLoading(prev => ({ ...prev, [ids[0]]: false }));
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {urlCampId && (
                        <Link href={`/admin/camps/${urlCampId}`} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1 mb-2">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            <span>Back to Dashboard</span>
                        </Link>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Registration Management</h1>
                    <p className="text-slate-500 font-medium">Manage all camp purchases and completion states.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Camp:</label>
                        <select
                            value={selectedCampFilter}
                            onChange={(e) => setSelectedCampFilter(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Camps</option>
                            {camps.map(camp => (
                                <option key={camp.id} value={camp.id}>{camp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="status-filter" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status:</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Statuses</option>
                            <option value="important">⚠️ Important Flags</option>
                            <option value="completed">Completed</option>
                            <option value="missing">Missing / Incomplete</option>
                            <option value="invited">Invited</option>
                            <option value="uninvited">Uninvited</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {registrations.some(r => r.registration_state !== 'completed') && (
                            <button
                                onClick={() => handleChase(registrations.filter(r => r.registration_state !== 'completed').map(r => r.id))}
                                disabled={bulkChaseLoading}
                                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">campaign</span>
                                {bulkChaseLoading ? 'Chasing All...' : 'Chase All Missing'}
                            </button>
                        )}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Registration
                        </button>
                    </div>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Guardian</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Player</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Product / Camp</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-8">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : registrations.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{row.guardian_name}</div>
                                    <div className="text-xs text-slate-500">{row.guardian_email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {row.player_first_name ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white">{row.player_first_name} {row.player_last_name}</span>
                                            </div>
                                            {(() => {
                                                const answers = row.highlighted_answers || {};
                                                if (Object.keys(answers).length === 0) return null;
                                                return (
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(answers).map(([key, value], idx) => (
                                                            <span key={idx} className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-red-100 dark:border-red-900/30">
                                                                {key}: {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Not yet provided</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.product_name}</div>
                                    {row.camp_name && <div className="text-[10px] text-slate-400 font-bold uppercase">{row.camp_name}</div>}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.registration_state === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {row.registration_state}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {row.registration_state !== 'completed' && (
                                            <button
                                                onClick={() => handleChase([row.id])}
                                                disabled={chaseLoading[row.id]}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all border border-amber-500/20 active:scale-95 group"
                                                title="Send Reminder"
                                            >
                                                {chaseLoading[row.id] ? (
                                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[18px]">campaign</span>
                                                )}
                                                <span className="text-[10px] font-black uppercase tracking-tight">Chase</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditingRegistration(row)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && registrations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                    No registrations matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <header className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Registration</h2>
                                <p className="text-sm text-slate-500">Updating details for {editingRegistration.guardian_name}</p>
                            </div>
                            <button onClick={() => setEditingRegistration(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <form onSubmit={handleUpdate} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Details</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration Status</label>
                                        <select
                                            value={editingRegistration.registration_state}
                                            onChange={e => setEditingRegistration({ ...editingRegistration, registration_state: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10"
                                        >
                                            <option value="uninvited">Uninvited</option>
                                            <option value="invited">Invited</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Player First Name</label>
                                        <input
                                            type="text"
                                            value={editingRegistration.player_first_name || ''}
                                            onChange={e => setEditingRegistration({ ...editingRegistration, player_first_name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Player Last Name</label>
                                        <input
                                            type="text"
                                            value={editingRegistration.player_last_name || ''}
                                            onChange={e => setEditingRegistration({ ...editingRegistration, player_last_name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Form Responses</h3>
                                    {editingRegistration.registration_data ? (
                                        <div className="space-y-4">
                                            {(() => {
                                                try {
                                                    const data = JSON.parse(editingRegistration.registration_data);
                                                    const formSchema = editingRegistration.schema_json ? JSON.parse(editingRegistration.schema_json) : [];

                                                    const getFieldLabel = (key: string) => {
                                                        const field = formSchema.find((f: any) => f.id === key);
                                                        return field ? field.label : key.replace(/_/g, ' ');
                                                    };

                                                    return Object.entries(data).map(([key, value]) => {
                                                        if (typeof value !== 'string') return null;
                                                        return (
                                                            <div key={key}>
                                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 transition-colors group-focus-within:text-blue-500">{getFieldLabel(key)}</label>
                                                                {key === 'medical_details' || key.length > 30 ? (
                                                                    <textarea
                                                                        value={value}
                                                                        onChange={e => {
                                                                            const newData = { ...data, [key]: e.target.value };
                                                                            setEditingRegistration({ ...editingRegistration, registration_data: JSON.stringify(newData) });
                                                                        }}
                                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 min-h-[80px]"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={value}
                                                                        onChange={e => {
                                                                            const newData = { ...data, [key]: e.target.value };
                                                                            setEditingRegistration({ ...editingRegistration, registration_data: JSON.stringify(newData) });
                                                                        }}
                                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-4 focus:ring-blue-500/10"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    });
                                                } catch (e) {
                                                    return <p className="text-xs text-red-500 font-bold">Corrupt registration data JSON</p>;
                                                }
                                            })()}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No registration data submitted yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                                <button
                                    type="button"
                                    onClick={handleDeleteRegistration}
                                    disabled={saveLoading}
                                    className="px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all mr-auto"
                                >
                                    Delete Registration
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingRegistration(null)}
                                    className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveLoading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {saveLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Registration Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <header className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Registration</h2>
                                <p className="text-sm text-slate-500">Manually invite a participant</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <form onSubmit={handleSubmitNewReg} className="p-8 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Guardian Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newRegData.guardianName}
                                    onChange={e => setNewRegData({ ...newRegData, guardianName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Guardian Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newRegData.guardianEmail}
                                    onChange={e => setNewRegData({ ...newRegData, guardianEmail: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                                    placeholder="jane.doe@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Camp</label>
                                <select
                                    required
                                    value={newRegData.campId}
                                    onChange={e => handleCampChange(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10"
                                >
                                    <option value="" disabled>Select Camp</option>
                                    {camps.map(camp => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
                                </select>
                            </div>
                            {newRegData.campId && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration Type / Product</label>
                                    <select
                                        required
                                        value={newRegData.productId}
                                        onChange={e => setNewRegData({ ...newRegData, productId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10"
                                    >
                                        <option value="" disabled>Select Product</option>
                                        {newRegProducts.map((cp: any) => (
                                            <option key={cp.product_id} value={cp.product_id}>
                                                {cp.product_name} - {getCurrencySymbol()} {cp.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmittingNewReg} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                                    {isSubmittingNewReg ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding...
                                        </>
                                    ) : 'Add & Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RegistrationsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-slate-500">Loading Management Console...</div>}>
            <RegistrationsContent />
        </Suspense>
    );
}

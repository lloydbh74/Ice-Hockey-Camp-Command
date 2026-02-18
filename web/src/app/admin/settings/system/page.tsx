"use client";

export const runtime = 'edge';


import React, { useState, useEffect } from "react";

const ADMIN_TOKEN = 'swedish-camp-admin-2026';

interface SystemSettings {
    admin_emails?: string;
    support_email?: string;
    brevo_api_key?: string;
    [key: string]: string | undefined;
}

export default function SystemSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({});
    const [editedSettings, setEditedSettings] = useState<SystemSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [showTestDialog, setShowTestDialog] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/system-settings", {
                headers: { 'X-Admin-Token': ADMIN_TOKEN }
            });
            if (!res.ok) throw new Error("Failed to fetch settings");

            const data = await res.json() as any;
            setSettings(data);
            setEditedSettings(data);
        } catch (e) {
            console.error("Failed to fetch settings", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/system-settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify(editedSettings)
            });

            if (res.ok) {
                setSettings(editedSettings);
                alert("Settings saved successfully!");
            } else {
                const error = await res.json() as any;
                alert(`Failed to save: ${error.error}`);
            }
        } catch (e: any) {
            console.error("Failed to save settings", e);
            alert(`Failed to save settings: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) return alert("Please enter a test email address");
        setTesting(true);
        try {
            const res = await fetch("/api/admin/system-settings/test-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify({ to: testEmail })
            });

            const data = await res.json() as any;
            if (res.ok) {
                alert("Test email sent successfully! Please check your inbox (and spam folder).");
                setShowTestDialog(false);
            } else {
                alert(`Failed to send test email: ${data.error}`);
            }
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setTesting(false);
        }
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(editedSettings);

    const adminEmails = (editedSettings.admin_emails || '').split(',').map(e => e.trim()).filter(Boolean);

    return (
        <div className="max-w-5xl mx-auto px-8 py-10">
            <nav className="flex items-center gap-2 mb-4">
                <a href="/admin" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors">Admin</a>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-900 dark:text-slate-50 text-sm font-semibold">System Settings</span>
            </nav>

            <header className="mb-10">
                <h2 className="text-[#0d161c] dark:text-white text-4xl font-black leading-tight tracking-tight mb-2">System Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">Manage camp logistics, user access controls, and core system configurations.</p>
            </header>

            <div className="flex flex-col gap-10">
                {/* Admin Access */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-[#0d161c] dark:text-white text-xl font-bold">Admin Access</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage who has administrative control over the camp system.</p>
                    </div>

                    <div className="p-8">
                        <label htmlFor="admin-emails" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                            Admin Email Addresses
                        </label>
                        <input
                            id="admin-emails"
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 font-mono text-sm"
                            placeholder="admin@example.com, admin2@example.com"
                            value={editedSettings.admin_emails || ''}
                            onChange={e => setEditedSettings({ ...editedSettings, admin_emails: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Comma-separated list. {adminEmails.length} admin(s) configured.
                        </p>
                    </div>
                </section>

                {/* Email Configuration */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-[#0d161c] dark:text-white text-xl font-bold">Email Configuration</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Configure Brevo API for transactional emails (300/day free).</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-4xl">mail</span>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Support / From Email</label>
                                <input
                                    type="email"
                                    value={editedSettings.support_email || ''}
                                    onChange={e => setEditedSettings({ ...editedSettings, support_email: e.target.value })}
                                    placeholder="info@swedishcamp.com"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">Used as the &quot;From&quot; address on all emails</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Brevo API Key</label>
                                <input
                                    type="password"
                                    value={editedSettings.brevo_api_key || ''}
                                    onChange={e => setEditedSettings({ ...editedSettings, brevo_api_key: e.target.value })}
                                    placeholder="xsmtpsib-..."
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">Get yours from <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">brevo.com/settings/keys</a></p>
                            </div>
                        </div>
                        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setTestEmail(editedSettings.support_email || '');
                                    setShowTestDialog(true);
                                }}
                                className="px-5 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all flex items-center gap-2 group border border-transparent hover:border-blue-500/50"
                            >
                                <span className="material-symbols-outlined text-xl">forward_to_inbox</span>
                                Send Test Email
                            </button>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditedSettings(settings)}
                                    disabled={!hasChanges}
                                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Discard
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={!hasChanges || saving}
                                    className="bg-nordic-midnight text-white px-8 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-nordic-midnight/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Test Email Modal */}
                {showTestDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-8">
                            <h3 className="text-xl font-bold dark:text-white mb-2">Send Test Email</h3>
                            <p className="text-slate-500 text-sm mb-6">Verify your system email settings by sending a test message.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Recipient Email</label>
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={e => setTestEmail(e.target.value)}
                                        className="w-full mt-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowTestDialog(false)}
                                        className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleTestEmail}
                                        disabled={testing}
                                        className="flex-1 px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {testing ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : <span>Send Now</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {hasChanges && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">warning</span>
                        <div className="flex-1">
                            <div className="font-bold text-amber-900 dark:text-amber-100 text-sm">Unsaved Changes</div>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

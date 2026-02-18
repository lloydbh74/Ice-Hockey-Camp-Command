"use client";

export const runtime = 'edge';


import React, { useState, useEffect } from "react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            window.location.href = `/api/admin/auth/verify?token=${token}`;
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const response = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json() as any;

            if (response.ok) {
                setStatus("success");
                setMessage(data.message);
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to request login link.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("A network error occurred.");
        }
        // ...existing code...
    };

    const handleDevLogin = async () => {
        setStatus("loading");
        try {
            const response = await fetch("/api/admin/auth/dev-login", {
                method: "POST",
            });
            const data = await response.json() as any;

            if (response.ok) {
                // Redirect manually since we set the cookie
                window.location.href = "/admin";
            } else {
                setStatus("error");
                setMessage(data.error || "Dev login failed");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Network error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto mb-4">
                        <span className="material-symbols-outlined text-white text-2xl">landscape</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Swedish Camp Command</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Organiser Access Control</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {status === "success" ? (
                        <div className="text-center py-4">
                            <div className="size-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h2 className="text-white font-bold text-lg mb-2">Check your email</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
                            <button
                                onClick={() => setStatus("idle")}
                                className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
                            >
                                Try another email
                            </button>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Organiser Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@swedishcamp.se"
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    />
                                </div>

                                {status === "error" && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {status === "loading" ? (
                                        <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Send Magic Link</span>
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={handleDevLogin}
                                        type="button"
                                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold py-3 px-4 rounded-xl transition-all border border-amber-500/20 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">terminal</span>
                                        <span>Dev Bypass Login</span>
                                    </button>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-slate-500 text-[10px] leading-relaxed uppercase tracking-tighter">
                                    Restricted area. Unauthorized access attempts are logged.
                                    <br />Session tokens expire automatically.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

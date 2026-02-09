"use client";

import { useState, useEffect } from "react";

export type LinkType = 'url' | 'phone' | 'email';

export interface LinkData {
    type: LinkType;
    value: string;
}

interface LinkInsertionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: LinkData) => void;
    onRemove: () => void;
    initialData?: LinkData | null;
}

export default function LinkInsertionModal({ isOpen, onClose, onSave, onRemove, initialData }: LinkInsertionModalProps) {
    const [linkType, setLinkType] = useState<LinkType>(initialData?.type || 'url');
    const [inputValue, setInputValue] = useState(initialData?.value || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!inputValue.trim()) return; // Simple validation
        onSave({ type: linkType, value: inputValue });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">Insert Link</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Link Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link Type</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            {[
                                { id: 'url', label: 'URL', icon: 'language' },
                                { id: 'phone', label: 'Phone', icon: 'call' },
                                { id: 'email', label: 'Email', icon: 'mail' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setLinkType(type.id as LinkType)}
                                    className={`flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${linkType === type.id
                                        ? 'bg-white text-primary shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg mb-0.5">{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {linkType === 'url' ? 'Website URL' : linkType === 'phone' ? 'Phone Number' : 'Email Address'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-lg">
                                    {linkType === 'url' ? 'public' : linkType === 'phone' ? 'dialpad' : 'alternate_email'}
                                </span>
                            </div>
                            <input
                                type={linkType === 'email' ? 'email' : linkType === 'phone' ? 'tel' : 'url'}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={
                                    linkType === 'url' ? 'https://example.com' :
                                        linkType === 'phone' ? '+1 (555) 000-0000' :
                                            'name@example.com'
                                }
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-slate-800"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-lg">
                    <button
                        onClick={() => { onRemove(); onClose(); }}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                        Remove Link
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

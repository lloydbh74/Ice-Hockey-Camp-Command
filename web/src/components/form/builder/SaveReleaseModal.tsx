"use client";

import { useState } from "react";

type VersionType = "patch" | "minor" | "major";

interface SaveReleaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { type: VersionType; changelog: string }) => void;
    currentVersion: string;
}

export default function SaveReleaseModal({ isOpen, onClose, onSave, currentVersion }: SaveReleaseModalProps) {
    const [versionType, setVersionType] = useState<VersionType>("patch");
    const [changelog, setChangelog] = useState("");

    if (!isOpen) return null;

    const [major, minor, patch] = currentVersion.split('.').map(Number);

    const nextVersions = {
        patch: `${major}.${minor}.${patch + 1}`,
        minor: `${major}.${minor + 1}.0`,
        major: `${major + 1}.0.0`
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Save & Release</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Choose a version impact for this update</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid gap-3">
                        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${versionType === 'patch' ? 'border-primary bg-glacier-blue/30 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <input type="radio" name="version" className="mt-1" checked={versionType === 'patch'} onChange={() => setVersionType('patch')} />
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex justify-between w-full min-w-[300px]">
                                    <span>Patch (Bug Fix)</span>
                                    <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{nextVersions.patch}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Tiny updates, typos, non-structural changes.</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${versionType === 'minor' ? 'border-primary bg-glacier-blue/30 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <input type="radio" name="version" className="mt-1" checked={versionType === 'minor'} onChange={() => setVersionType('minor')} />
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex justify-between w-full min-w-[300px]">
                                    <span>Minor (Feature)</span>
                                    <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{nextVersions.minor}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">New questions, sections, or logic changes.</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${versionType === 'major' ? 'border-primary bg-glacier-blue/30 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <input type="radio" name="version" className="mt-1" checked={versionType === 'major'} onChange={() => setVersionType('major')} />
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex justify-between w-full min-w-[300px]">
                                    <span>Major (Release)</span>
                                    <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{nextVersions.major}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Significant restructuring or breaking changes.</p>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Changelog</label>
                        <textarea
                            value={changelog}
                            onChange={(e) => setChangelog(e.target.value)}
                            placeholder="What validation rules did you change?"
                            className="w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ type: versionType, changelog })}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 shadow-sm transition-colors"
                    >
                        Confirm Save
                    </button>
                </div>
            </div>
        </div>
    );
}

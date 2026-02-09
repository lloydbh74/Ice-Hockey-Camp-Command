"use client";

interface HistoryItem {
    id: number;
    version: string;
    changelog: string;
    created_at: string;
}

export default function VersionHistoryPanel({ currentVersion, history }: { currentVersion: string; history?: HistoryItem[] }) {
    return (
        <div className="p-4 border-t border-slate-100 bg-slate-50 overflow-y-auto max-h-64">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-700">Version History</h3>
                <span className="text-[10px] text-slate-400">Latest First</span>
            </div>
            <div className="space-y-2">
                {/* Active Version */}
                <div className="flex items-start gap-2 text-xs p-2 bg-white border border-green-200 rounded-md shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0 relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                        <div className="font-medium text-slate-800">v{currentVersion} (Live)</div>
                        <div className="text-slate-500 mt-0.5">Current Active Version</div>
                    </div>
                </div>

                {/* History List */}
                {history?.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-xs p-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm rounded-md">
                        <div className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0"></div>
                        <div>
                            <div className="font-medium text-slate-700">v{item.version}</div>
                            <div className="text-slate-500 mt-0.5 max-w-[180px] break-words">{item.changelog || "No changelog"}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{new Date(item.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                ))}

                {(!history || history.length === 0) && (
                    <div className="text-center text-[10px] text-slate-400 py-2">
                        No previous versions
                    </div>
                )}
            </div>
        </div>
    );
}

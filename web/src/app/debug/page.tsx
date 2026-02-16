
export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';

export default async function DebugPage() {
    let dbStatus = "Checking...";
    let envCheck = "Checking...";
    let errorDetail = "";

    try {
        const ctx = getRequestContext();
        envCheck = JSON.stringify(Object.keys(ctx.env || {}));

        // Explicitly cast to any to avoid TS errors in this debug file if types are strict
        const db = (ctx.env as any).DB;

        if (db) {
            const result = await db.prepare("SELECT 1 as val").first();
            dbStatus = `Connected! Result: ${JSON.stringify(result)}`;
        } else {
            dbStatus = "DB Binding is MISSING in getRequestContext().env";
        }

    } catch (e: any) {
        dbStatus = "Error connecting to DB";
        errorDetail = e.message + "\n" + e.stack;
    }

    return (
        <div className="p-10 font-mono text-sm bg-black text-green-400 min-h-screen">
            <h1 className="text-xl font-bold mb-4">Edge Runtime Debugger</h1>

            <div className="mb-4">
                <h2 className="text-white mb-1">Environment Keys:</h2>
                <div className="p-4 border border-green-800 rounded">{envCheck}</div>
            </div>

            <div className="mb-4">
                <h2 className="text-white mb-1">Database Status:</h2>
                <div className="p-4 border border-green-800 rounded">{dbStatus}</div>
            </div>

            {errorDetail && (
                <div className="mb-4">
                    <h2 className="text-red-500 mb-1">Error Details:</h2>
                    <pre className="p-4 border border-red-800 rounded text-red-300 whitespace-pre-wrap">
                        {errorDetail}
                    </pre>
                </div>
            )}
        </div>
    );
}

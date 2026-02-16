
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export default async function DebugPage() {
    let dbStatus = "Checking...";
    let envCheck = "Checking...";
    let errorDetail = "";

    try {
        const ctx = getRequestContext();
        const env = ctx.env as any;

        if (env) {
            envCheck = "ENV Found: " + Object.keys(env).join(", ");

            if (env.DB) {
                try {
                    const result = await env.DB.prepare("SELECT 1 as val").first();
                    dbStatus = `Connected! Result: ${JSON.stringify(result)}`;
                } catch (dbErr: any) {
                    dbStatus = "DB Binding Found but Query Failed";
                    errorDetail = dbErr.message;
                }
            } else {
                dbStatus = "DB Binding MISSING. Available keys: " + Object.keys(env).join(", ");
            }
        } else {
            envCheck = "ctx.env is undefined (Not running in Pages context?)";
        }

    } catch (e: any) {
        dbStatus = "Critical Error";
        errorDetail = e.message + "\n" + e.stack;
    }

    return (
        <div className="p-10 font-mono text-sm bg-black text-green-400 min-h-screen">
            <h1 className="text-xl font-bold mb-4">Edge Runtime Debugger (Advanced)</h1>
            <p className="mb-4 text-gray-400">Middleware is BYPASSED for this route.</p>

            <div className="mb-4">
                <h2 className="text-white mb-1">Environment:</h2>
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

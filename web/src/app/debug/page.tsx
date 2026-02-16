
export const runtime = 'edge';

export default function DebugPage() {
    return (
        <div className="p-10 font-mono text-sm bg-black text-green-400 min-h-screen">
            <h1 className="text-xl font-bold mb-4">Edge Runtime Debugger (Simple)</h1>
            <p className="text-white">If you can see this, the basic Edge Runtime is working.</p>
            <p className="text-gray-400 mt-4">Middleware was bypassed for this route.</p>
        </div>
    );
}

export const runtime = 'edge';

export default function DebugPage() {
    return (
        <div style={{ padding: 40, background: '#000', color: '#0f0', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1>Debug: Hello World</h1>
            <p>If you see this, SSR on Edge Runtime is working.</p>
            <p>next/font removed. Middleware disabled.</p>
        </div>
    );
}

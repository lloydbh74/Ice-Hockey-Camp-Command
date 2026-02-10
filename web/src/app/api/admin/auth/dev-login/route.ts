import { NextRequest, NextResponse } from 'next/server';
import { getDb, createAdminSession } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    try {
        const db = await getDb();

        // Self-healing: Ensure table exists in dev environment
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS AdminSessions (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
        `).run();

        // Create session for dev user
        const sessionId = (globalThis as any).crypto.randomUUID();
        const sessionExpiresAt = new Date();
        sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 day session
        const devEmail = 'dev@local.test';

        await createAdminSession(db, sessionId, devEmail, sessionExpiresAt);

        // Manual cookie set for Edge compatibility
        const response = NextResponse.json({ success: true, message: 'Dev login successful' });
        const expiresString = sessionExpiresAt.toUTCString();
        response.headers.append('Set-Cookie', `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresString}`);

        return response;

    } catch (error: any) {
        console.error('[API] Dev login error:', error);

        // Extended debug info
        try {
            const db = await getDb();
            // Check if AdminSessions table exists
            const tableCheck = await db.prepare("PRAGMA table_info(AdminSessions)").all();
            console.error('[API] AdminSessions table info:', JSON.stringify(tableCheck.results));

            // List all tables
            const allTables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            console.error('[API] All tables:', JSON.stringify(allTables.results));
        } catch (dbError) {
            console.error('[API] DB Debug Error:', dbError);
        }

        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

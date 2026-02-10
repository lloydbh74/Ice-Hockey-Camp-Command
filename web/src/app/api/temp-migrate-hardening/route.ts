import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        console.log('[MIGRATION] Running hardening updates...');

        await db.prepare(`
            CREATE TABLE IF NOT EXISTS IngestionLogs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_email_id TEXT,
                status TEXT NOT NULL,
                message TEXT,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        await db.prepare(`
            INSERT OR IGNORE INTO SystemSettings (key, value) 
            VALUES ('ingestion_token', 'swedish-camp-ingest-2026')
        `).run();

        return NextResponse.json({ success: true, message: "Ingestion logs table created and token seeded" });
    } catch (error: any) {
        console.error('[MIGRATION] Hardening error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        console.log('[MIGRATION] Running manual column addition for CampProducts...');

        // Check if status column exists in CampProducts
        const cpTableInfo = await db.prepare("PRAGMA table_info(CampProducts)").all();
        const hasStatus = cpTableInfo.results?.some((col: any) => col.name === 'status');

        if (!hasStatus) {
            await db.prepare("ALTER TABLE CampProducts ADD COLUMN status TEXT DEFAULT 'active'").run();
            await db.prepare("ALTER TABLE CampProducts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP").run();
            return NextResponse.json({ success: true, message: "CampProducts status/updated_at columns added" });
        }

        return NextResponse.json({ success: true, message: "CampProducts columns already exist" });
    } catch (error: any) {
        console.error('[MIGRATION] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

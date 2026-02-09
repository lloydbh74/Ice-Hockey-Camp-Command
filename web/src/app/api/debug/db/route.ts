
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    try {
        const db = await getDb();

        // 1. List Tables
        const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

        // 2. Force Create Table (Code-First Migration)
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS FormHistory (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                form_id INTEGER NOT NULL, 
                version TEXT NOT NULL, 
                schema_json TEXT NOT NULL, 
                changelog TEXT, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // 3. List Again
        const tablesAfter = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

        return NextResponse.json({
            status: 'Migration Attempted',
            tables_before: tables.results,
            tables_after: tablesAfter.results
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

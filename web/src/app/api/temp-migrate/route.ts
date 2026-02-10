import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        console.log('[MIGRATION] Running manual column addition...');

        // Check if SKU column exists
        const tableInfo = await db.prepare("PRAGMA table_info(Products)").all();
        const hasSku = tableInfo.results?.some((col: any) => col.name === 'sku');

        if (!hasSku) {
            await db.prepare("ALTER TABLE Products ADD COLUMN sku TEXT").run();
            await db.prepare("CREATE UNIQUE INDEX idx_products_sku ON Products (sku)").run();
            return NextResponse.json({ success: true, message: "SKU column and index added" });
        }

        return NextResponse.json({ success: true, message: "SKU column already exists" });
    } catch (error: any) {
        console.error('[MIGRATION] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

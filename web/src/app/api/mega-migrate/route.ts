import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const results: any[] = [];

        async function checkAndAddColumn(tableName: string, colName: string, type: string) {
            try {
                const tableInfo = await db.prepare(`PRAGMA table_info(${tableName})`).all();
                const exists = tableInfo.results?.some((col: any) => col.name === colName);
                if (!exists) {
                    await db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${type}`).run();
                    results.push(`Added ${colName} to ${tableName}`);
                } else {
                    results.push(`${colName} already in ${tableName}`);
                }
            } catch (e) {
                results.push(`Failed to check/add ${colName} to ${tableName}: ${e}`);
            }
        }

        await checkAndAddColumn('Camps', 'status', 'TEXT DEFAULT "active"');
        await checkAndAddColumn('Camps', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');

        await checkAndAddColumn('Products', 'status', 'TEXT DEFAULT "active"');
        await checkAndAddColumn('Products', 'base_price', 'REAL DEFAULT 0.0');
        await checkAndAddColumn('Products', 'form_template_id', 'INTEGER REFERENCES FormTemplates(id)');
        await checkAndAddColumn('Products', 'sku', 'TEXT');

        await checkAndAddColumn('CampProducts', 'status', 'TEXT DEFAULT "active"');
        await checkAndAddColumn('CampProducts', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');

        await checkAndAddColumn('Purchases', 'price_at_purchase', 'REAL');
        await checkAndAddColumn('Purchases', 'currency', 'TEXT DEFAULT "GBP"');
        await checkAndAddColumn('Purchases', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');

        return NextResponse.json({ success: true, changes: results });
    } catch (error: any) {
        console.error('[MIGRATION] Mega error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

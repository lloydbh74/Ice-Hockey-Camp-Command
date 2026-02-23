import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const db = await getDb();

        const testSearch = await db.prepare(`
            SELECT 
                pu.id,
                pr.id as product_id,
                pr.name as product_name,
                f.id as form_id,
                f.is_active,
                f.schema_json as current_active_schema,
                r.form_response_json as historical_answers,
                p.first_name || ' ' || p.last_name as player_name
            FROM Purchases pu
            JOIN Products pr ON pu.product_id = pr.id
            JOIN Registrations r ON r.purchase_id = pu.id
            JOIN Players p ON r.player_id = p.id
            LEFT JOIN Forms f ON pr.id = f.product_id AND f.is_active = 1
            WHERE p.first_name = 'Albin' OR p.first_name = 'Alexander'
            LIMIT 2
        `).all();

        return NextResponse.json({
            debugPayload: testSearch.results
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

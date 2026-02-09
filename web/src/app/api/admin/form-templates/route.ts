import { NextResponse } from 'next/server';
import { getDb, getFormTemplates } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { results } = await getFormTemplates(db);
        return NextResponse.json(results || []);
    } catch (error: any) {
        console.error('[API] getFormTemplates error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

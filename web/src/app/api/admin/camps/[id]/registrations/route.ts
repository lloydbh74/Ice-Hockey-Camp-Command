import { NextResponse } from 'next/server';
import { getDb, listPurchasesByCamp } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { results } = await listPurchasesByCamp(db, id);
        return NextResponse.json(results || []);
    } catch (error: any) {
        console.error('[API] listPurchasesByCamp error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

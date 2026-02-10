import { NextRequest, NextResponse } from 'next/server';
import { getDb, listAllPurchases, listPurchasesByCamp } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId');
    const status = searchParams.get('status');

    try {
        const db = await getDb();
        let results: any[] = [];

        if (campId) {
            const data = await listPurchasesByCamp(db, parseInt(campId));
            results = data.results || [];
        } else {
            const data = await listAllPurchases(db);
            results = data.results || [];
        }

        // Apply filters
        if (status === 'missing') {
            results = results.filter(r => r.registration_state !== 'completed');
        } else if (status) {
            results = results.filter(r => r.registration_state === status);
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('[API] Registrations list error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

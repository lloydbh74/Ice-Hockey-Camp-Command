import { NextResponse } from 'next/server';
import { getDb, getIngestionLogs } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { results } = await getIngestionLogs(db, 50);
        return NextResponse.json(results || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

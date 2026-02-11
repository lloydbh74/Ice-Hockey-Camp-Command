import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCampDays } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const campId = parseInt(id);

    try {
        const db = await getDb();
        const days = await getCampDays(db, campId);
        return NextResponse.json({ results: days });
    } catch (error: any) {
        console.error('Failed to fetch public camp days:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

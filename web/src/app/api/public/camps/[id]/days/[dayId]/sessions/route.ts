import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSessionsForDay } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; dayId: string }> }
) {
    const { id, dayId } = await params;
    const campDayId = parseInt(dayId);

    try {
        const db = await getDb();
        const sessions = await getSessionsForDay(db, campDayId);
        return NextResponse.json({ results: sessions });
    } catch (error: any) {
        console.error('Failed to fetch public sessions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

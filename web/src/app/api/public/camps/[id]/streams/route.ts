import { NextRequest, NextResponse } from 'next/server';
import { getDb, getStreams } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const campId = parseInt(id);

    try {
        const db = await getDb();
        const streams = await getStreams(db, campId);
        return NextResponse.json({ results: streams });
    } catch (error: any) {
        console.error('Failed to fetch public streams:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

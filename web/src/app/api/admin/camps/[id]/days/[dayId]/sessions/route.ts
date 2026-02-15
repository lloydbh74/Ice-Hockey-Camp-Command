import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSessionsForDay, createSession, assignSessionStreams } from '@/lib/db';
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; dayId: string }> }
) {
    const { id, dayId } = await params;

    // Validate IDs
    const campId = parseInt(id);
    const campDayId = parseInt(dayId);

    if (isNaN(campId) || isNaN(campDayId)) {
        return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    try {
        const sessionId = await getSession();
        const db = await getDb();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;

        if (!adminEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const sessions = await getSessionsForDay(db, campDayId);
        return NextResponse.json({ results: sessions });
    } catch (error: any) {
        console.error('Failed to fetch sessions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; dayId: string }> }
) {
    const { id, dayId } = await params;

    // Validate IDs
    const campId = parseInt(id);
    const campDayId = parseInt(dayId);

    if (isNaN(campId) || isNaN(campDayId)) {
        return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    try {
        const sessionId = await getSession();
        const db = await getDb();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;

        if (!adminEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { name, description, start_time, end_time, location, stream_ids } = body;

        if (!name || !start_time || !end_time) {
            return NextResponse.json({ error: 'Name, start_time, and end_time are required' }, { status: 400 });
        }

        // 1. Create Session
        const result = await createSession(db, {
            id: 0, // Placeholder, ignored by INSERT
            camp_day_id: campDayId,
            name,
            description,
            start_time,
            end_time,
            location
        });

        // 2. Assign Streams if provided (using the last inserted ID)
        if (result.meta?.last_row_id && Array.isArray(stream_ids) && stream_ids.length > 0) {
            await assignSessionStreams(db, result.meta.last_row_id, stream_ids);
        }

        return NextResponse.json({ success: true, result }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

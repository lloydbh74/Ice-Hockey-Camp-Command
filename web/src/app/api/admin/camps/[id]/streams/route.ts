import { NextRequest, NextResponse } from 'next/server';
import { getDb, getStreams, createStream } from '@/lib/db';
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const campId = parseInt(id);

    try {
        const sessionId = await getSession();
        const db = await getDb();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;

        if (!adminEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const streams = await getStreams(db, campId);
        return NextResponse.json({ results: streams });
    } catch (error: any) {
        console.error('Failed to fetch streams:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const campId = parseInt(id);

    try {
        const sessionId = await getSession();
        const db = await getDb();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;

        if (!adminEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as any;
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const result = await createStream(db, { camp_id: campId, name });

        return NextResponse.json({ success: true, result }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create stream:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

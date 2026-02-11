import { NextRequest, NextResponse } from 'next/server';
import { getDb, assignSessionStreams } from '@/lib/db';
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    const sessionInt = parseInt(sessionId);

    if (isNaN(sessionInt)) {
        return NextResponse.json({ error: 'Invalid Session ID' }, { status: 400 });
    }

    try {
        const authSessionId = await getSession();
        const db = await getDb();
        const adminEmail = authSessionId ? await verifySession(db, authSessionId) : null;

        if (!adminEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { stream_ids } = body;

        if (!Array.isArray(stream_ids)) {
            return NextResponse.json({ error: 'stream_ids array is required' }, { status: 400 });
        }

        await assignSessionStreams(db, sessionInt, stream_ids);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to assign streams:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

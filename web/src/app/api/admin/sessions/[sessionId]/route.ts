import { NextRequest, NextResponse } from 'next/server';
import { getDb, updateSession, deleteSession } from '@/lib/db';
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function PUT(
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

        const body = await request.json() as any;
        // Force refresh build cache

        await updateSession(db, sessionInt, body);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to update session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
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
        await deleteSession(db, sessionInt);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCampDays, createCampDay, deleteCampDay } from '@/lib/db';
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
        const days = await getCampDays(db, campId);
        return NextResponse.json({ results: days });
    } catch (error: any) {
        console.error('Failed to fetch camp days:', error);
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
        const { date, label } = body;

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const result = await createCampDay(db, { camp_id: campId, date, label });

        return NextResponse.json({ success: true, result }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create camp day:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getDb, updateCamp, getCampById } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const camp = await getCampById(db, id);
        if (!camp) {
            return NextResponse.json({ error: 'Camp not found' }, { status: 404 });
        }

        return NextResponse.json(camp);
    } catch (error: any) {
        console.error('[API] getCamp error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const body: any = await req.json();
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const result = await updateCamp(db, id, body);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API] updateCamp error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

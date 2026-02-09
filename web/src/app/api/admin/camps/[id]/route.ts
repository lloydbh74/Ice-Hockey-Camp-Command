import { NextResponse } from 'next/server';
import { getDb, updateCamp, getCampById, deleteCamp } from '@/lib/db';

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

        // Get purchase count to inform UI about delete/archive options
        const purchaseCount = await db.prepare("SELECT COUNT(*) as count FROM Purchases WHERE camp_id = ?").bind(id).first<number>('count');

        return NextResponse.json({ ...camp, purchase_count: purchaseCount || 0 });
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await deleteCamp(db, id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        // Simple error handling: check message for the specific constraint
        console.error('[API] deleteCamp error:', error);
        if (error.message && error.message.includes('existing purchases')) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

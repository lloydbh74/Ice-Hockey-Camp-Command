import { NextResponse } from 'next/server';
import { getDb, getCampProducts, associateProductWithCamp, removeProductFromCamp } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);
        const { results } = await getCampProducts(db, id);
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const campId = parseInt(idStr);
        const body: any = await req.json();

        if (!body.productId || body.price === undefined) {
            return NextResponse.json({ error: 'ProductID and Price are required' }, { status: 400 });
        }

        const result = await associateProductWithCamp(db, {
            campId,
            productId: body.productId,
            price: body.price
        });
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const campId = parseInt(idStr);
        const { searchParams } = new URL(req.url);
        const cpId = parseInt(searchParams.get('cpId') || '');

        if (isNaN(cpId)) {
            return NextResponse.json({ error: 'Missing or invalid cpId' }, { status: 400 });
        }

        await removeProductFromCamp(db, campId, cpId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

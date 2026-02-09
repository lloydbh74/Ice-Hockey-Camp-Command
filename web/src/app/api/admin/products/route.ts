import { NextResponse } from 'next/server';
import { getDb, listProducts, createProduct } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { results } = await listProducts(db);
        return NextResponse.json(results || []);
    } catch (error: any) {
        console.error('[API] listProducts error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = await getDb();
        const body: any = await req.json();

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const result = await createProduct(db, {
            name: body.name,
            description: body.description,
            base_price: body.basePrice || 0,
            form_template_id: body.formTemplateId
        });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API] createProduct error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

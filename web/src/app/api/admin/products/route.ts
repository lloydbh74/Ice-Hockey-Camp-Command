import { NextResponse } from 'next/server';
import { getDb, createFormFromTemplate } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) {
            console.error('[API] Database binding missing');
            return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });
        }

        const { results } = await db.prepare("SELECT * FROM Products ORDER BY name ASC").all();
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('[API] getProducts error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { name, description, base_price, form_template_id } = await req.json();

        const result = await db.prepare(
            "INSERT INTO Products (name, description, base_price, status, form_template_id) VALUES (?, ?, ?, 'active', ?)"
        ).bind(name, description || null, base_price, form_template_id || null).run();

        // If a form template was selected, create the Form
        if (form_template_id && result.meta.last_row_id) {
            await createFormFromTemplate(db, result.meta.last_row_id, form_template_id);
        }

        return NextResponse.json({ id: result.meta.last_row_id });
    } catch (error: any) {
        console.error('[API] createProduct error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

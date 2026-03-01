import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('X-Admin-Token');
    if (token !== 'swedish-camp-admin-2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = await getDb();
        const products = await db.prepare('SELECT * FROM Products').all();
        const forms = await db.prepare('SELECT * FROM Forms').all();
        const templates = await db.prepare('SELECT * FROM FormTemplates').all();

        return NextResponse.json({
            products: products.results,
            forms: forms.results,
            templates: templates.results
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}

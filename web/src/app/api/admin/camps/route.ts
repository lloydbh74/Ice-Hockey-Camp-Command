import { NextResponse } from 'next/server';
import { getDb, listCamps, createCamp } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) {
            console.error('[API] DB binding missing');
            return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });
        }

        const { results } = await listCamps(db);
        return NextResponse.json(results || []);
    } catch (error: any) {
        console.error('[API] listCamps error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = await getDb();
        const body: any = await req.json();

        if (!body.name || !body.year) {
            return NextResponse.json({ error: 'Name and Year are required' }, { status: 400 });
        }

        const result = await createCamp(db, { name: body.name, year: body.year });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API] createCamp error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

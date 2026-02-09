
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        const { results } = await db.prepare('SELECT id, name, version, is_published, is_active FROM Forms ORDER BY id DESC').all();
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching forms list:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

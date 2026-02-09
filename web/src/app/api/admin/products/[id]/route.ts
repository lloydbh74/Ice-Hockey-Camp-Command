import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const body: any = await req.json();
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Simple update logic inline for now to save db.ts bloating
        const sets: string[] = [];
        const values: any[] = [];

        ['name', 'description', 'base_price', 'status', 'form_template_id'].forEach(key => {
            if (body[key] !== undefined) {
                sets.push(`${key === 'base_price' ? 'base_price' : key} = ?`);
                values.push(body[key]);
            }
        });

        if (sets.length === 0) return NextResponse.json({ message: 'No changes' });

        values.push(id);
        const result = await db.prepare(`UPDATE Products SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
            .bind(...values)
            .run();

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API] updateProduct error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

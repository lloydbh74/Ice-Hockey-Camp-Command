import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);
        const { searchParams } = new URL(req.url);
        const force = searchParams.get('force') === 'true';

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // 1. Check for existing purchases
        const purchaseCount = await db.prepare("SELECT COUNT(*) as count FROM Purchases WHERE camp_id = ?").bind(id).first<number>('count');

        if (purchaseCount && purchaseCount > 0 && !force) {
            return NextResponse.json({
                error: 'Cannot deactivate camp with active purchases.',
                confirmationRequired: true,
                message: `This camp has ${purchaseCount} existing purchases. Deactivating it will prevent new signups but keep historical data. Are you sure?`
            }, { status: 409 });
        }

        // 2. Perform Soft Deactivate
        await db.prepare("UPDATE Camps SET status = 'deactivated', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();

        return NextResponse.json({ success: true, status: 'deactivated' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Reactivate endpoint
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await db.prepare("UPDATE Camps SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();

        return NextResponse.json({ success: true, status: 'active' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

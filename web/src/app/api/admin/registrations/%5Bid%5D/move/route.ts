import { NextRequest, NextResponse } from "next/server";
import { getDb, moveRegistrationBetweenProducts } from "@/lib/db";
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const purchaseId = parseInt(params.id, 10);
        const { productId } = await req.json() as { productId: number };

        if (!purchaseId || !productId) {
            return NextResponse.json({ error: "Missing purchaseId or productId" }, { status: 400 });
        }

        const db = await getDb();
        if (!db) return NextResponse.json({ error: "Missing DB" }, { status: 500 });

        const sessionId = await getSession();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;
        if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await moveRegistrationBetweenProducts(db, purchaseId, productId);

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(`[Admin API] Move Player Error:`, e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getDb, moveRegistrationBetweenProducts, getPurchaseById } from "@/lib/db";
import { getSession, verifySession } from '@/lib/admin-auth';
import { EmailService } from "@/lib/services/email-service";

export const runtime = 'edge';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const purchaseId = parseInt(id, 10);
        const { productId, resetAndResend } = await req.json() as { productId: number; resetAndResend?: boolean };

        if (!purchaseId || !productId) {
            return NextResponse.json({ error: "Missing purchaseId or productId" }, { status: 400 });
        }

        const db = await getDb();
        if (!db) return NextResponse.json({ error: "Missing DB" }, { status: 500 });

        const sessionId = await getSession();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;
        if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await moveRegistrationBetweenProducts(db, purchaseId, productId, !!resetAndResend);

        if (resetAndResend) {
            const purchase = await getPurchaseById(db, purchaseId);
            if (purchase && purchase.registration_token) {
                await EmailService.sendRegistrationInvitation(db, {
                    to: purchase.guardian_email,
                    guardianName: purchase.guardian_name,
                    productName: purchase.product_name,
                    token: purchase.registration_token
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(`[Admin API] Move Player Error:`, e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

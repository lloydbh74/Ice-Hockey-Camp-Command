import { NextRequest, NextResponse } from 'next/server';
import { getDb, getPurchaseByToken, getActiveForm } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const db = await getDb();

        // 1. Resolve Purchase
        const purchase = await getPurchaseByToken(db, token);
        if (!purchase) {
            return NextResponse.json({ error: 'Invalid or expired registration link' }, { status: 404 });
        }

        // 2. Resolve Active Form for the Product
        const form = await getActiveForm(db, purchase.product_id);
        if (!form) {
            return NextResponse.json({ error: 'Registration form not configured for this product' }, { status: 500 });
        }

        // 3. Safe parse schema
        let formSchema = [];
        try {
            const parsed = JSON.parse(form.schema_json);
            formSchema = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error(`[API] Corrupt schema for form ${form.id}:`, e);
        }

        // 4. Return context
        return NextResponse.json({
            purchase: {
                id: purchase.id,
                guardian_name: purchase.guardian_name,
                guardian_email: purchase.guardian_email,
                product_name: purchase.product_name,
                registration_state: purchase.registration_state,
                quantity: purchase.quantity
            },
            form: {
                id: form.id,
                name: form.name,
                schema: formSchema
            }
        });

    } catch (error: any) {
        console.error("Registration fetch error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

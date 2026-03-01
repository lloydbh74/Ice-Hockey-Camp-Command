import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { EmailService } from '@/lib/services/email-service';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const db = await getDb();
        const body = await request.json() as any;
        const { purchaseId, formId, formData, registrationToken } = body;

        if (!purchaseId || !formId || !formData || !registrationToken) {
            return NextResponse.json({ error: 'Missing required submission data' }, { status: 400 });
        }

        // 1. Fetch Purchase context (with token verification) and Guardian/Product details
        const purchase = await db.prepare(`
            SELECT p.*, g.email as guardian_email, g.full_name as guardian_name, pr.name as product_name 
            FROM Purchases p
            JOIN Guardians g ON p.guardian_id = g.id
            JOIN Products pr ON p.product_id = pr.id
            WHERE p.id = ? AND p.registration_token = ?
        `).bind(purchaseId, registrationToken).first<any>();

        if (!purchase) return NextResponse.json({ error: 'Purchase not found or token invalid' }, { status: 404 });

        // 2. Extract core player fields from formData
        // We expect IDs like 'first_name', 'last_name', 'dob', 'sex' from the form schema
        const firstName = formData.first_name || 'Unknown';
        const lastName = formData.last_name || 'Player';
        const dob = formData.dob || '2015-01-01';
        const sex = formData.sex || 'Unknown';

        // 3. Upsert Player Record
        // (Simple matching by name and DOB for the same guardian)
        await db.prepare(`
            INSERT INTO Players (guardian_id, first_name, last_name, date_of_birth, sex)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                sex = EXCLUDED.sex
        `).bind(purchase.guardian_id, firstName, lastName, dob, sex).run();

        const player = await db.prepare("SELECT id FROM Players WHERE guardian_id = ? AND first_name = ? AND last_name = ? AND date_of_birth = ?")
            .bind(purchase.guardian_id, firstName, lastName, dob)
            .first<{ id: number }>();

        if (!player) throw new Error("Failed to resolve player after save");

        // 4. Create Registration Record
        await db.prepare(`
            INSERT INTO Registrations (purchase_id, player_id, form_id, registration_timestamp, form_response_json)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
        `).bind(purchaseId, player.id, formId, JSON.stringify(formData)).run();

        // 5. Update Purchase State
        await db.prepare("UPDATE Purchases SET registration_state = 'completed', registration_data = ? WHERE id = ?")
            .bind(JSON.stringify(formData), purchaseId)
            .run();

        // 6. Send Confirmation Email
        if (purchase.guardian_email) {
            try {
                await EmailService.sendRegistrationConfirmation(db, {
                    to: purchase.guardian_email,
                    guardianName: purchase.guardian_name || 'Guardian',
                    productName: purchase.product_name || 'Camp',
                    formData: formData
                });
            } catch (e) {
                console.error("Failed to send confirmation email", e);
                // We do not fail the submission if email fails
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Registration submission error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

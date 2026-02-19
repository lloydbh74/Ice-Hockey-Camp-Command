import { NextRequest, NextResponse } from 'next/server';
import { getDb, getPurchaseById } from '@/lib/db';
import { EmailService } from '@/lib/services/email-service';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const db = await getDb();
        const body = await request.json() as { purchaseIds: number[] };
        const { purchaseIds } = body;

        if (!purchaseIds || !Array.isArray(purchaseIds) || purchaseIds.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid purchaseIds array' }, { status: 400 });
        }

        const results = [];

        for (const id of purchaseIds) {
            try {
                const purchase = await getPurchaseById(db, id);
                if (!purchase) {
                    results.push({ id, success: false, error: 'Purchase not found' });
                    continue;
                }

                if (!purchase.registration_token) {
                    results.push({ id, success: false, error: 'No registration token available' });
                    continue;
                }

                const emailResult = await EmailService.sendRegistrationReminder(db, {
                    to: purchase.guardian_email,
                    guardianName: purchase.guardian_name,
                    productName: purchase.product_name,
                    token: purchase.registration_token
                });

                if (emailResult.success) {
                    // Update state to invited if it was uninvited
                    if (purchase.registration_state === 'uninvited') {
                        await db.prepare('UPDATE Purchases SET registration_state = "invited" WHERE id = ?')
                            .bind(id)
                            .run();
                    }
                    results.push({ id, success: true });
                } else {
                    results.push({ id, success: false, error: emailResult.error });
                }
            } catch (innerError: any) {
                results.push({ id, success: false, error: innerError.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        return NextResponse.json({
            success: true,
            results,
            summary: {
                total: results.length,
                success: successCount,
                failures: failureCount
            }
        });

    } catch (error: any) {
        console.error('[API] Registrations chase error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

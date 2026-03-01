import { NextRequest, NextResponse } from 'next/server';
import { getDb, listAllPurchases, listPurchasesByCamp, updateRegistrationDetails, deleteRegistration } from '@/lib/db';
import { EmailService } from '@/lib/services/email-service';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId');
    const status = searchParams.get('status');
    const query = searchParams.get('q') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    try {
        const db = await getDb();
        let results: any[] = [];

        if (campId) {
            const data = await listPurchasesByCamp(db, parseInt(campId), query, limit);
            results = data.results || [];
        } else {
            const data = await listAllPurchases(db, query, limit);
            results = data.results || [];
        }

        // Apply fallback status filters (though search is primary)
        if (status === 'missing') {
            results = results.filter(r => r.registration_state !== 'completed');
        } else if (status) {
            results = results.filter(r => r.registration_state === status);
        }

        // Map highlighted answers from the schema
        results = results.map(row => {
            const responses = JSON.parse(row.registration_data || '{}');
            const schema = JSON.parse(row.schema_json || '[]');
            const highlightedFields = schema.filter((field: any) => field.isHighlighted);

            const highlighted_answers: Record<string, string> = {};

            highlightedFields.forEach((field: any) => {
                const val = responses[field.label] || responses[field.id];
                if (val) {
                    highlighted_answers[field.label] = val as string;
                } else {
                    const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
                    const normalizedLabel = normalizeKey(field.label);

                    let fallbackKey = Object.keys(responses).find(k => normalizeKey(k) === normalizedLabel);

                    if (!fallbackKey) {
                        const legacyMapping: Record<string, string> = {
                            'suffer from asthma': 'med_asthma',
                            'suffer from allergies bites stings food': 'med_allergies',
                            'suffer from diabetes': 'med_diabetes',
                            'require an epipen': 'med_allergies',
                            'suffered a concussion': 'med_concussion',
                            'undergone any surgery in the past 2 years': 'med_surgery',
                            'suffered any broken bones in the last 2 years': 'med_broken_bones',
                            'currently have a medical condition illness or injury': 'medical_details'
                        };

                        const mappedLegacyKey = legacyMapping[normalizedLabel];
                        if (mappedLegacyKey && responses[mappedLegacyKey]) {
                            fallbackKey = mappedLegacyKey;
                        } else {
                            const excludeWords = ['suffer', 'from', 'have', 'currently', 'take', 'require', 'any', 'the', 'last', 'years', 'please', 'details'];
                            const significantWords = normalizedLabel
                                .split(' ')
                                .filter(w => w.length > 3 && !excludeWords.includes(w));

                            if (significantWords.length > 0) {
                                fallbackKey = Object.keys(responses).find(k => {
                                    const normK = normalizeKey(k);
                                    return significantWords.some(w => normK.includes(w)) && (k.startsWith('med_') || k.startsWith('emergency'));
                                });
                            }
                        }
                    }

                    if (fallbackKey && responses[fallbackKey]) {
                        const valStr = String(responses[fallbackKey]).trim();
                        if (valStr && valStr.toLowerCase() !== 'false') {
                            highlighted_answers[field.label] = valStr;
                        }
                    }
                }
            });

            return {
                ...row,
                highlighted_answers
            };
        });

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('[API] Registrations list error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const db = await getDb();
        const body = (await request.json()) as any;
        const { purchaseId, ...updateData } = body;

        if (!purchaseId) {
            return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
        }

        await updateRegistrationDetails(db, purchaseId, updateData);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API] Registrations update error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const db = await getDb();
        const { searchParams } = new URL(request.url);
        const purchaseId = searchParams.get('purchaseId');

        if (!purchaseId) {
            return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
        }

        await deleteRegistration(db, parseInt(purchaseId));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API] Registrations delete error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const db = await getDb();
        const body = (await request.json()) as any;
        const { guardianName, guardianEmail, campId, productId } = body;

        if (!guardianName || !guardianEmail || !campId || !productId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const normalizedEmail = guardianEmail.toLowerCase().trim();

        // 1. Upsert Guardian
        await db.prepare("INSERT OR IGNORE INTO Guardians (email, full_name) VALUES (?, ?)").bind(normalizedEmail, guardianName).run();
        const guardian = await db.prepare("SELECT id FROM Guardians WHERE email = ?").bind(normalizedEmail).first<{ id: number }>();
        if (!guardian) throw new Error("Failed to resolve guardian");

        // 2. Fetch CampProduct price
        const campProduct = await db.prepare("SELECT price FROM CampProducts WHERE camp_id = ? AND product_id = ?").bind(campId, productId).first<{ price: number }>();
        if (!campProduct) throw new Error("Product is not associated with this camp");

        const product = await db.prepare("SELECT name FROM Products WHERE id = ?").bind(productId).first<{ name: string }>();
        if (!product) throw new Error("Product not found");

        const pricePaid = campProduct.price;
        const registrationToken = crypto.randomUUID();
        const rawEmailId = `manual-${Date.now()}`;

        // 3. Create Purchase
        await db.prepare(`
            INSERT INTO Purchases (
                guardian_id, camp_id, product_id, quantity, registration_state, 
                purchase_timestamp, raw_email_id, price_at_purchase, currency, registration_token
            ) VALUES (?, ?, ?, 1, 'invited', datetime('now'), ?, ?, 'GBP', ?)
        `).bind(
            guardian.id, campId, productId, rawEmailId, pricePaid, registrationToken
        ).run();

        // 4. Trigger Invitation Email
        const emailResult = await EmailService.sendRegistrationInvitation(db, {
            to: normalizedEmail,
            guardianName: guardianName,
            productName: product.name,
            token: registrationToken
        });

        if (!emailResult.success) {
            console.warn(`[Admin API] Failed to send manual invitation email: ${emailResult.error}`);
            // We still return success but maybe add a warning
        }

        return NextResponse.json({ success: true, message: 'Registration added successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('[API] Manual registration error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

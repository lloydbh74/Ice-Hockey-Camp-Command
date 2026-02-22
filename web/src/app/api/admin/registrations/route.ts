import { NextRequest, NextResponse } from 'next/server';
import { getDb, listAllPurchases, listPurchasesByCamp, updateRegistrationDetails } from '@/lib/db';

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
                let val = responses[field.label] || responses[field.id];
                if (val) {
                    highlighted_answers[field.label] = val as string;
                } else {
                    const normalizeKey = (k: string) => k.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
                    const normalizedLabel = normalizeKey(field.label);

                    const fallbackKey = Object.keys(responses).find(k => normalizeKey(k) === normalizedLabel);
                    if (fallbackKey && responses[fallbackKey]) {
                        highlighted_answers[field.label] = responses[fallbackKey] as string;
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

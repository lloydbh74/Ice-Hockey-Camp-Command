import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAttendanceList } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const campId = parseInt(id);

    if (isNaN(campId)) {
        return NextResponse.json({ error: 'Invalid Camp ID' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const { results } = await getAttendanceList(db, campId);

        const attendance = (results || []).map((row: any) => {
            const responses = JSON.parse(row.form_response_json || '{}');
            const schema = JSON.parse(row.schema_json || '[]');

            // Find highlighted field labels and IDs
            const highlightedFields = schema.filter((field: any) => field.isHighlighted);

            const criticalInfo: Record<string, string> = {};

            // Find matches in user's submission
            highlightedFields.forEach((field: any) => {
                // Find answer whose key matches label exactly, or whose ID matches
                let val = responses[field.label] || responses[field.id];
                if (val) {
                    criticalInfo[field.label] = val as string;
                } else {
                    // Try loose matching fallback
                    const normalizeKey = (k: string) => k.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
                    const normalizedLabel = normalizeKey(field.label);

                    const fallbackKey = Object.keys(responses).find(k => normalizeKey(k) === normalizedLabel);
                    if (fallbackKey && responses[fallbackKey]) {
                        criticalInfo[field.label] = responses[fallbackKey] as string;
                    }
                }
            });

            return {
                id: row.registration_id,
                playerName: row.player_name,
                dob: row.date_of_birth,
                guardianName: row.guardian_name,
                productName: row.product_name,
                status: row.registration_state,
                timestamp: row.registration_timestamp,
                criticalInfo,
                fullResponse: responses
            };
        });

        return NextResponse.json({ results: attendance });

    } catch (error: any) {
        console.error('[API] Attendance List error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

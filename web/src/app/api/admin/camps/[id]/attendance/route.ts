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

            // Promote critical fields
            const criticalInfo: Record<string, string> = {};
            const criticalKeywords = ['medical', 'allergy', 'emergency', 'health', 'condition'];

            Object.entries(responses).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase();
                if (criticalKeywords.some(kw => lowerKey.includes(kw)) && value) {
                    criticalInfo[key] = value as string;
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

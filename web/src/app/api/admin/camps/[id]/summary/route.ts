import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCampSummary, getCampById } from '@/lib/db';

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

        const [camp, summary] = await Promise.all([
            getCampById(db, campId),
            getCampSummary(db, campId)
        ]);

        if (!camp) {
            return NextResponse.json({ error: 'Camp not found' }, { status: 404 });
        }

        const total = summary?.total_purchases || 0;
        const completed = summary?.completed_registrations || 0;
        const missing = summary?.missing_registrations || 0;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return NextResponse.json({
            camp: {
                id: camp.id,
                name: camp.name,
                year: camp.year
            },
            stats: {
                totalPurchases: total,
                completedRegistrations: completed,
                missingRegistrations: missing,
                completionPercentage: Math.round(completionRate * 10) / 10
            }
        });

    } catch (error: any) {
        console.error('[API] Camp Summary error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

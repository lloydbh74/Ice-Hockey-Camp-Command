import { NextRequest, NextResponse } from 'next/server';
import { getDb, getKitOrderSummary, getKitPersonalizationList } from '@/lib/db';

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
        const summary = await getKitOrderSummary(db, campId);
        const personalizations = await getKitPersonalizationList(db, campId);

        // Convert to a more UI-friendly array format
        const formattedSummary = Object.entries(summary).map(([itemType, sizes]) => ({
            itemType,
            orders: Object.entries(sizes).map(([size, quantity]) => ({
                size,
                quantity
            })).sort((a, b) => b.quantity - a.quantity)
        }));

        return NextResponse.json({
            summary: formattedSummary,
            personalizations
        });

    } catch (error: any) {
        console.error('[API] Kit Orders error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

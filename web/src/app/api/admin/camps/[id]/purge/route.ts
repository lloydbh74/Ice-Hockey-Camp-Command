import { NextRequest, NextResponse } from 'next/server';
import { getDb, purgeCampSensitiveData } from '@/lib/db';

export const runtime = 'edge';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const campId = parseInt(id);

        if (isNaN(campId)) {
            return NextResponse.json({ error: 'Invalid camp ID' }, { status: 400 });
        }

        const db = await getDb();
        const success = await purgeCampSensitiveData(db, campId);

        if (success) {
            return NextResponse.json({ success: true, message: 'Sensitive data purged successfully.' });
        } else {
            return NextResponse.json({ error: 'Failed to purge data.' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('[API] Camp purge error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: error.message?.includes('not archived') ? 403 : 500 }
        );
    }
}

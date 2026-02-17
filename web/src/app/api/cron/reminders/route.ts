import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/lib/db';
import { ReminderService } from '@/lib/services/reminder-service';

export const runtime = 'edge';

/**
 * Endpoint for Cloudflare Workers Cron Trigger to process registration reminders.
 * Protection: Expects a CRON_SECRET header or token in production.
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const { env } = getRequestContext() as any;
    const cronSecret = env.CRON_SECRET || 'swedish-camp-cron-2026';


    // Simple secret check
    if (authHeader !== `Bearer ${cronSecret}` && request.nextUrl.searchParams.get('token') !== cronSecret) {
        // In local dev we might skip this or allow it
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const db = await getDb();
        if (!db) throw new Error("Database binding missing");

        await ReminderService.processReminders(db);

        return NextResponse.json({
            success: true,
            message: "Reminder processing complete",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[CRON] Reminder Process Failed:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

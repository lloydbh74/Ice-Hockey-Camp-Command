import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);

        const settings = await db.prepare("SELECT * FROM CampSettings WHERE camp_id = ?").bind(id).first();
        return NextResponse.json(settings || { error: 'Not found' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const db = await getDb();
        const id = parseInt(idStr);
        const body: any = await req.json();

        // Upsert logic
        await db.prepare(`
            INSERT INTO CampSettings (camp_id, reminders_enabled, reminder_cadence_days, max_reminders)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(camp_id) DO UPDATE SET
                reminders_enabled = excluded.reminders_enabled,
                reminder_cadence_days = excluded.reminder_cadence_days,
                max_reminders = excluded.max_reminders
        `).bind(id, body.remindersEnabled ? 1 : 0, body.reminderCadenceDays || 7, body.maxReminders || 3).run();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

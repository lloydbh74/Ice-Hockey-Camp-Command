import { NextResponse } from 'next/server';
import { getDb, getSystemSettings, updateSystemSetting } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { results } = await getSystemSettings(db);

        // Convert array of {key, value} to object
        const settings: Record<string, string> = {};
        if (results) {
            results.forEach((row: any) => {
                settings[row.key] = row.value;
            });
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        console.error('[API] getSystemSettings error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const body: Record<string, string> = await req.json();

        // Validate email fields
        const emailFields = ['admin_emails', 'support_email'];
        for (const field of emailFields) {
            if (body[field]) {
                const emails = field === 'admin_emails'
                    ? body[field].split(',').map(e => e.trim())
                    : [body[field]];

                for (const email of emails) {
                    if (email && !isValidEmail(email)) {
                        return NextResponse.json({
                            error: `Invalid email format: ${email}`
                        }, { status: 400 });
                    }
                }
            }
        }

        // Update each setting
        for (const [key, value] of Object.entries(body)) {
            await updateSystemSetting(db, key, value);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] updateSystemSettings error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

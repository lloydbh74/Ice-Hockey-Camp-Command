import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { EmailService } from '@/lib/services/email-service';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const { to } = await request.json() as any;
        if (!to) return NextResponse.json({ error: 'Recipient address is required' }, { status: 400 });

        const db = await getDb();

        const result = await EmailService.sendEmail(db, {
            to,
            subject: 'SMTP Configuration Test - Swedish Camp Command',
            text: 'If you see this, your SMTP configuration is correct and working from Cloudflare Edge!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <h2 style="color: #0f172a; margin-top: 0;">SMTP Test Successful! 📧</h2>
                    <p style="color: #475569; line-height: 1.6;">Congratulations, your Swedish Camp Command email infrastructure is now live and correctly configured using your camp's SMTP servers.</p>
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px;">Sent from Swedish Camp Command Infrastructure</p>
                </div>
            `
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Unknown SMTP error' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[API] Test email error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

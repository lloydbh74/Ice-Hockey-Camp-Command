import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAdminEmails, createMagicLink } from '@/lib/db';
import { EmailService } from '@/lib/services/email-service';


export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json() as any;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const db = await getDb();
        const adminEmails = await getAdminEmails(db);

        if (!adminEmails.includes(email.toLowerCase().trim())) {
            // For security, don't reveal if the email is invalid, 
            // but log it internally if needed.
            console.warn(`Unauthorized login attempt: ${email}`);
            return NextResponse.json({ success: true, message: 'If you are an authorized organiser, you will receive a login link.' });
        }

        const token = (globalThis as any).crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute expiry

        await createMagicLink(db, email, token, expiresAt);
        await EmailService.sendAdminMagicLink(db, { to: email, token });

        return NextResponse.json({ success: true, message: 'Login link sent to your email.' });

    } catch (error: any) {
        console.error('[API] Admin login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

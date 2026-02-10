import { NextRequest, NextResponse } from 'next/server';
import { getDb, getMagicLink, markMagicLinkUsed, createAdminSession } from '@/lib/db';
import { setSessionCookie } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/admin/login?error=Invalid token', request.url));
    }

    try {
        const db = await getDb();
        const magicLink = await getMagicLink(db, token);

        if (!magicLink) {
            return NextResponse.redirect(new URL('/admin/login?error=Link expired or already used', request.url));
        }

        const expiresAt = new Date(magicLink.expires_at);
        if (expiresAt < new Date()) {
            return NextResponse.redirect(new URL('/admin/login?error=Link expired', request.url));
        }

        // Token is valid!
        await markMagicLinkUsed(db, token);

        // Create session
        const sessionId = (globalThis as any).crypto.randomUUID();
        const sessionExpiresAt = new Date();
        sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 day session

        await createAdminSession(db, sessionId, magicLink.email, sessionExpiresAt);

        // Use a response that we can set the cookie on
        const response = NextResponse.redirect(new URL('/admin', request.url));

        // We need to set the cookie. setSessionCookie uses next/headers which might not work directly in a NextResponse return
        // but let's try the library helper first. Actually, setSessionCookie uses cookies() which is for Server Components/Actions.
        // For API routes, we might need to set it manually on the response or use a specific pattern.

        // Manual cookie set for Edge compatibility in API route redirect
        const expiresString = sessionExpiresAt.toUTCString();
        response.headers.append('Set-Cookie', `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresString}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

        return response;

    } catch (error) {
        console.error('[API] Admin verify error:', error);
        return NextResponse.redirect(new URL('/admin/login?error=Internal Server Error', request.url));
    }
}

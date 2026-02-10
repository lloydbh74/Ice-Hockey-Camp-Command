import { cookies } from 'next/headers';
import { D1Database } from '@cloudflare/workers-types';
import { createAdminSession, getAdminSession, deleteAdminSession } from './db';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_DAYS = 7;

export async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) return null;
    return sessionId;
}

export async function verifySession(db: D1Database, sessionId: string) {
    const session = await getAdminSession(db, sessionId);

    if (!session) return null;

    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
        await deleteAdminSession(db, sessionId);
        return null;
    }

    return session.email;
}

export async function setSessionCookie(sessionId: string) {
    const cookieStore = await cookies();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt
    });
}

export async function clearSession(db: D1Database) {
    const sessionId = await getSession();
    if (sessionId) {
        await deleteAdminSession(db, sessionId);
    }

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

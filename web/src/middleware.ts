import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Admin Protection
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Skip auth check for specific public admin routes
        const isPublicAdminRoute = [
            '/admin/login',
            '/api/admin/auth/login',
            '/api/admin/auth/verify',
            '/api/admin/auth/dev-login'
        ].some(route => pathname === route);

        if (isPublicAdminRoute) {
            return NextResponse.next();
        }

        const sessionId = request.cookies.get('admin_session')?.value;
        const adminToken = request.headers.get('X-Admin-Token'); // Automation/Backdoor bypass for dev

        if (!sessionId && adminToken !== 'swedish-camp-admin-2026') {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    const response = NextResponse.next();

    // 2. Security Headers (Best Practices)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add a basic CSP if needed, but keeping it simple for now to avoid breaking styles
    // response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - static-debug.html (debug file)
         */
        '/((?!_next/static|_next/image|favicon.ico|static-debug.html).*)',
    ],
};

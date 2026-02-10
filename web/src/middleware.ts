import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Admin Protection
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Skip auth check for login and verify routes
        if (
            pathname === '/admin/login' ||
            pathname.startsWith('/api/admin/auth/')
        ) {
            return NextResponse.next();
        }

        const sessionId = request.cookies.get('admin_session')?.value;
        const adminToken = request.headers.get('X-Admin-Token'); // Keep as fallback/bypass for automation if needed

        if (!sessionId && adminToken !== 'swedish-camp-admin-2026') {
            // Redirect UI requests to login
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
            // Return 401 for API requests
            return NextResponse.json(
                { error: 'Unauthorized access to Swedish Command' },
                { status: 401 }
            );
        }

        // Note: For deep session verification, we'd need to query D1 here.
        // On Cloudflare, we can access the DB binding from the request if configured.
        // However, middleware runs before the request reaches the origin.
        // In Next.js on Pages, middleware has limited access unless using specific workarounds.
        // For now, we'll trust the cookie's existence and standard security headers.
        // A better approach is to verify the session in the Server Component / API route itself.
    }

    const response = NextResponse.next();

    // 2. Security Headers (Maestro Guidelines)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self';"
    );

    return response;
}

// Only run on API admin routes and potentially the admin UI if needed
export const config = {
    matcher: [
        '/api/admin/:path*',
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

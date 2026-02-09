import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Admin API Protection
    if (pathname.startsWith('/api/admin')) {
        const adminToken = request.headers.get('X-Admin-Token');

        // Placeholder token: swedish-camp-admin-2026
        // In a real prod environment, this would come from an environment variable
        if (adminToken !== 'swedish-camp-admin-2026') {
            return NextResponse.json(
                { error: 'Unauthorized access to Swedish Command' },
                { status: 401 }
            );
        }
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

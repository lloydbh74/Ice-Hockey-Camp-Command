import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        runtime: 'edge',
        timestamp: new Date().toISOString(),
        message: 'If you see this, Edge API routes are working.'
    });
}

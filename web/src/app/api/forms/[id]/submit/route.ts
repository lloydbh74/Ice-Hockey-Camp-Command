import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, props: RouteContext) {
    const params = await props.params;
    const { id } = params;
    const formId = parseInt(id, 10);

    if (isNaN(formId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const body = await request.json() as any;

        // FUTURE: In a real implementation, we would validate against the schema here.
        // For now, we log the submission and return success to unblock frontend dev.
        console.log(`[SUBMISSION] Form ${formId} received:`, JSON.stringify(body, null, 2));

        // Mock success response
        return NextResponse.json({
            success: true,
            message: 'Registration submitted successfully!',
            submissionId: Date.now()
        });
    } catch (error) {
        console.error("Error processing form submission:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('X-Admin-Token');
        if (token !== 'swedish-camp-admin-2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // For now, since R2 is not configured, we'll convert to a Base64 Data URI
        // This is only for MVP purposes and sizing charts which are typically small.
        // In a production environment, this should upload to Cloudflare R2.

        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        // Limit size to prevent D1/KV bloat if this was stored there, 
        // but here it's just returned to the client to be stored in the Form JSON.
        if (buffer.byteLength > 500 * 1024) { // 500KB limit for Base64 in JSON
            return NextResponse.json({ error: 'File too large (Max 500KB for non-R2 storage)' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            url: dataUri,
            note: "Stored as Data URI. Configure R2 for permanent storage."
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

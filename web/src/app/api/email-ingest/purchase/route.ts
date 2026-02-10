import { NextRequest, NextResponse } from "next/server";
import { getDb, getIngestionToken } from "@/lib/db";
import { IngestionService } from "@/lib/services/ingestion-service";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        // 1. Bearer Token Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const validToken = await getIngestionToken(db);

        if (token !== validToken) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();

        // 3. Process Ingestion
        const result = await IngestionService.processIngestion(db, body);

        if (result.alreadyProcessed) {
            return NextResponse.json({
                success: true,
                message: "Record already processed",
                purchaseId: result.purchaseId
            }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            purchaseIds: result.purchaseIds,
            guardianId: result.guardianId
        }, { status: 201 });

    } catch (error: any) {
        console.error('[API] Ingestion error:', error);

        // Structured error handling (Zod or mapping failures)
        if (error.status) {
            return NextResponse.json({
                error: error.message,
                details: error.details
            }, { status: error.status });
        }

        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.stack?.split('\n').filter((l: string) => l.includes('IngestionService')).slice(0, 3)
        }, { status: 500 });
    }
}


import { NextRequest, NextResponse } from "next/server";
import { getDb, getAdminEmails, getCampByFuzzyName, createPurchaseTransactions } from "@/lib/db";
import { EmailParserService } from "@/lib/services/email-parser";

export const runtime = 'edge';

interface CloudflareEmailPayload {
    from: string;
    to: string;
    subject: string;
    body: string; // The raw text body forwarded by Email Worker
    rawEmailId?: string; // Optional message-id
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json() as CloudflareEmailPayload;
        const db = await getDb();

        console.log(`[API] Received email webhook from ${payload.from}`);

        // 1. Security Check: Validate Sender
        const authorizedSenders = await getAdminEmails(db);
        // Also allow local testing/mocking if needed, but strict for prod
        // For this MVP, we enforce the check.
        const isAuthorized = authorizedSenders.includes(payload.from.trim());

        if (!isAuthorized) {
            console.warn(`[API] Unauthorized sender: ${payload.from}`);
            return NextResponse.json({ error: "Unauthorized sender" }, { status: 403 });
        }

        // 2. Parse Logic
        const parsedData = EmailParserService.parse(payload.subject, payload.body, payload.from);

        if (!parsedData) {
            console.error(`[API] Failed to parse email body`);
            return NextResponse.json({ error: "Parsing failed" }, { status: 400 });
        }

        // 3. Resolve Camp
        const camp = await getCampByFuzzyName(db, parsedData.campName);
        if (!camp) {
            console.error(`[API] Camp not found: ${parsedData.campName}`);
            return NextResponse.json({ error: `Camp '${parsedData.campName}' not found` }, { status: 404 });
        }

        // 4. Create Transaction
        await createPurchaseTransactions(db, {
            ...parsedData,
            campId: camp.id,
            rawEmailId: payload.rawEmailId || `mock-${Date.now()}`
        });

        return NextResponse.json({ success: true, camp: camp.name, guardian: parsedData.guardianEmail });

    } catch (e: any) {
        console.error(`[API] Error processing webhook: ${e.message}`);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

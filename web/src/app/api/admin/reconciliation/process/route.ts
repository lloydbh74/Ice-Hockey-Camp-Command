import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { EmailService } from "@/lib/services/email-service";
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: "Missing DB" }, { status: 500 });

        const sessionId = await getSession();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;
        if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        interface ProcessRecord {
            orderId: string;
            orderNumber: string;
            guardianEmail: string;
            guardianName: string;
            systemProductName: string;
            campId: number;
            productId: number;
            price: number;
            isProblemOrder?: boolean;
        }

        const body = await req.json() as { records: ProcessRecord[] };
        const { records } = body;

        if (!records || !Array.isArray(records)) {
            return NextResponse.json({ error: "Invalid payload, Expected an array of records" }, { status: 400 });
        }

        interface ProcessResult {
            orderId: string;
            success: boolean;
            status: string;
        }

        interface ProcessError {
            orderId: string;
            error: string;
        }

        const results: ProcessResult[] = [];
        const errors: ProcessError[] = [];

        // 1. Batch Upsert Guardians
        const guardianInsertStmts = records.map(r =>
            db.prepare("INSERT OR IGNORE INTO Guardians (email, full_name) VALUES (?, ?)").bind(r.guardianEmail, r.guardianName)
        );
        if (guardianInsertStmts.length > 0) {
            // chunk into 100s to respect D1 limits if needed, but assuming a reasonable CSV size for now
            await db.batch(guardianInsertStmts);
        }

        // 2. Batch Fetch Guardian IDs
        const guardianSelectStmts = records.map(r =>
            db.prepare("SELECT id, email FROM Guardians WHERE email = ?").bind(r.guardianEmail)
        );

        const guardianMap = new Map<string, number>();
        if (guardianSelectStmts.length > 0) {
            const guardianSelectResults = await db.batch<any>(guardianSelectStmts);
            for (const res of guardianSelectResults) {
                if (res.results && res.results.length > 0) {
                    guardianMap.set(res.results[0].email, res.results[0].id);
                }
            }
        }

        // 3. Batch Insert Purchases
        const purchaseStmts = [];
        const recordsToEmail = [];

        // Pre-fetch all products to verify existence
        const { results: productRows } = await db.prepare("SELECT id FROM Products").all<{ id: number }>();
        const validProductIds = new Set((productRows || []).map(p => p.id));

        // Retrieve camp definitions to send correct emails
        const { results: campRows } = await db.prepare("SELECT id, name FROM Camps").all<{ id: number, name: string }>();
        const campMap = new Map((campRows || []).map(c => [c.id, c.name]));

        for (const record of records) {
            try {
                const timestamp = new Date().getTime();
                let rawEmailId = `csv_import_${timestamp}_${record.orderNumber || globalThis.crypto.randomUUID()}`;

                if (record.isProblemOrder) {
                    rawEmailId = `[PROBLEM_ORDER]_${rawEmailId}`;
                }

                const guardianId = guardianMap.get(record.guardianEmail);
                if (!guardianId) throw new Error("Failed to map Guardian ID");

                const token = globalThis.crypto.randomUUID();
                const productId = record.productId;

                if (!productId || !validProductIds.has(productId)) {
                    throw new Error(`Product "${record.systemProductName}" (ID: ${productId}) does not exist or is not defined in the repository. Please define the product before importing.`);
                }

                purchaseStmts.push(db.prepare(`
                    INSERT INTO Purchases (guardian_id, camp_id, product_id, quantity, registration_state, purchase_timestamp, raw_email_id, price_at_purchase, currency, registration_token)
                    VALUES (?, ?, ?, 1, 'uninvited', datetime('now'), ?, ?, 'GBP', ?)
                `).bind(guardianId, record.campId, productId, rawEmailId, record.price, token));

                recordsToEmail.push({
                    record,
                    token,
                    campName: campMap.get(record.campId) || 'Hockey Camp Sweden'
                });
            } catch (err: any) {
                errors.push({ orderId: record.orderId, error: err.message });
            }
        }

        if (purchaseStmts.length > 0) {
            await db.batch(purchaseStmts);
        }

        // 4. Send Emails Concurrently (with a slight throttle if necessary, but Promise.all is usually fine for < 50)
        await Promise.allSettled(recordsToEmail.map(async (item) => {
            try {
                await EmailService.sendRegistrationInvitation(db, {
                    to: item.record.guardianEmail,
                    guardianName: item.record.guardianName,
                    productName: item.record.systemProductName,
                    token: item.token
                });
                results.push({ orderId: item.record.orderId, success: true, status: 'Imported & Email Sent' });
            } catch (emailErr: any) {
                console.error(`Error sending email to ${item.record.guardianEmail}:`, emailErr);
                // Even if email fails, it was imported
                results.push({ orderId: item.record.orderId, success: true, status: 'Imported but Email Failed' });
                errors.push({ orderId: item.record.orderId, error: 'Email failed: ' + emailErr.message });
            }
        }));

        return NextResponse.json({
            success: true,
            summary: {
                totalProcessed: records.length,
                successCount: results.length,
                errorCount: errors.length
            },
            results,
            errors
        });

    } catch (e: any) {
        console.error(`[Admin API] CSV Process Error:`, e);
        return NextResponse.json({ error: e.message || "Failed to process CSV records" }, { status: 500 });
    }
}

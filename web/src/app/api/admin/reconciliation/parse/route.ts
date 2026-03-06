import { NextRequest, NextResponse } from "next/server";
import { getDb, getProductBySku, getCampById } from "@/lib/db";
import { CsvReconciliationParser, ShopSaleTransaction } from "@/lib/services/csv-reconciliation-parser";
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: "Missing DB" }, { status: 500 });

        const sessionId = await getSession();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;
        if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const csvText = await file.text();
        const transactions = CsvReconciliationParser.parseSalesCsv(csvText);

        interface ExtendedParsedRecord extends ShopSaleTransaction {
            campId?: number;
            productId?: number;
            systemProductName?: string;
            isProblemOrder?: boolean;
            isRefunded?: boolean;
            hasConflict?: boolean;
            purchaseId?: number;
            registrationState?: string;
            skipReason?: string;
            potentialMatch?: {
                purchaseId: number;
                dbEmail: string;
            } | null;
        }

        interface ManualRecord {
            id: number;
            guardianName: string;
            guardianEmail: string;
            productName: string;
            campId: number;
            campName?: string;
            registrationState: string;
            purchaseTimestamp: string;
            rawEmailId: string;
            isManual: boolean;
        }

        const existingPurchases: ExtendedParsedRecord[] = [];
        const missingPurchases: ExtendedParsedRecord[] = [];
        const skippedRecords: ExtendedParsedRecord[] = [];
        const manualOnlyRegistrations: ManualRecord[] = [];

        // 0. Track which Camp IDs are involved to do the reverse lookup
        const activeCampIds = new Set<number>();
        const processedTxByEmailAndProduct = new Set<string>();

        // Pre-fetch all camps for display/mapping
        const { results: allCamps } = await db.prepare("SELECT id, name FROM Camps").all<{ id: number, name: string }>();
        const campNames = new Map((allCamps || []).map(c => [c.id, c.name]));

        // 1. First Pass: Process CSV Transactions
        for (const tx of transactions) {
            if (!tx.productSku) {
                skippedRecords.push({ ...tx, skipReason: 'No SKU' });
                continue;
            }

            const productMatch = await getProductBySku(db, tx.productSku);
            if (!productMatch) {
                skippedRecords.push({ ...tx, skipReason: `SKU not found: ${tx.productSku}` });
                continue;
            }

            const { product, campId } = productMatch;
            activeCampIds.add(campId);

            // Check for existing purchase via Email + Camp + Product
            const existingPurchase = await db.prepare(`
                SELECT p.id as purchase_id, p.registration_state, g.id as guardian_id, g.full_name as guardian_name
                FROM Purchases p
                JOIN Guardians g ON p.guardian_id = g.id
                WHERE g.email = ? AND p.camp_id = ? AND p.product_id = ?
            `).bind(tx.guardianEmail.trim().toLowerCase(), campId, product.id).first<{ purchase_id: number, registration_state: string, guardian_id: number, guardian_name: string }>();

            const record = {
                ...tx,
                campId: campId,
                productId: product.id,
                systemProductName: product.name,
                isProblemOrder: tx.orderStatus.toUpperCase() === 'PROBLEM' || tx.orderStatus.toUpperCase() === 'REFUNDED' || tx.orderStatus.toUpperCase() === 'VOID',
                isRefunded: tx.orderStatus.toUpperCase() === 'REFUNDED',
            };

            if (existingPurchase) {
                processedTxByEmailAndProduct.add(`${tx.guardianEmail.trim().toLowerCase()}-${campId}-${product.id}`);

                // Conflict detection: Shop says Refunded but DB is Active
                const hasConflict = record.isRefunded && (existingPurchase.registration_state === 'completed' || existingPurchase.registration_state === 'invited');

                existingPurchases.push({
                    ...record,
                    purchaseId: existingPurchase.purchase_id,
                    registrationState: existingPurchase.registration_state,
                    hasConflict
                });
            } else {
                // Fuzzy matching attempt: Same Name + Same Product/Camp but different email
                const fuzzyMatch = await db.prepare(`
                    SELECT p.id as purchase_id, g.email as db_email
                    FROM Purchases p
                    JOIN Guardians g ON p.guardian_id = g.id
                    WHERE g.full_name = ? AND p.camp_id = ? AND p.product_id = ?
                    LIMIT 1
                `).bind(tx.guardianName.trim(), campId, product.id).first<{ purchase_id: number, db_email: string }>();

                missingPurchases.push({
                    ...record,
                    potentialMatch: fuzzyMatch ? {
                        purchaseId: fuzzyMatch.purchase_id,
                        dbEmail: fuzzyMatch.db_email
                    } : null
                });
            }
        }

        // 2. Second Pass: Find Manual/BACS entries (Reverse Audit)
        if (activeCampIds.size > 0) {
            for (const campId of Array.from(activeCampIds)) {
                const dbRegistrations = await db.prepare(`
                    SELECT p.id as purchase_id, p.registration_state, p.purchase_timestamp, p.raw_email_id, p.price_at_purchase,
                           g.full_name as guardian_name, g.email as guardian_email,
                           prod.name as product_name, prod.sku as product_sku
                    FROM Purchases p
                    JOIN Guardians g ON p.guardian_id = g.id
                    JOIN Products prod ON p.product_id = prod.id
                    WHERE p.camp_id = ?
                `).bind(campId).all<{ purchase_id: number, registration_state: string, purchase_timestamp: string, raw_email_id: string, price_at_purchase: number, guardian_name: string, guardian_email: string, product_name: string, product_sku: string }>();

                for (const reg of dbRegistrations.results || []) {
                    const key = `${reg.guardian_email.toLowerCase()}-${campId}-${reg.product_sku}`;
                    // If this DB record wasn't matched to any CSV row, it's a Manual/BACS entry
                    if (!processedTxByEmailAndProduct.has(key)) {
                        manualOnlyRegistrations.push({
                            id: reg.purchase_id,
                            guardianName: reg.guardian_name,
                            guardianEmail: reg.guardian_email,
                            productName: reg.product_name,
                            campId: campId,
                            campName: campNames.get(campId),
                            registrationState: reg.registration_state,
                            purchaseTimestamp: reg.purchase_timestamp,
                            rawEmailId: reg.raw_email_id,
                            isManual: reg.raw_email_id?.startsWith('manual-')
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                totalParsed: transactions.length,
                existingMatchCount: existingPurchases.length,
                missingCount: missingPurchases.length,
                skippedCount: skippedRecords.length,
                manualCount: manualOnlyRegistrations.length
            },
            data: {
                missing: missingPurchases,
                existing: existingPurchases,
                skipped: skippedRecords,
                manualOnly: manualOnlyRegistrations
            }
        });

    } catch (e: any) {
        console.error(`[Admin API] CSV Parse Error:`, e);
        return NextResponse.json({ error: e.message || "Failed to parse CSV" }, { status: 500 });
    }
}

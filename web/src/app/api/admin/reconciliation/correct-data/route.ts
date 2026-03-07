import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession, verifySession } from '@/lib/admin-auth';

export const runtime = 'edge';

/**
 * Temporary utility API to correct registrations imported with the wrong product ID (ID 1 / Hat-Trick Heroes)
 */
export async function POST(req: NextRequest) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: "Missing DB" }, { status: 500 });

        const sessionId = await getSession();
        const adminEmail = sessionId ? await verifySession(db, sessionId) : null;
        if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Fetch correct Product IDs for the SKUs
        const skus = ['HCS-ADULT', 'HCS-ADV-ELITE', 'HCS-ADV-PRO', 'HCS-NYLANDER', 'HCS-KEMPE'];
        const { results: products } = await db.prepare("SELECT id, sku, name FROM Products WHERE sku IN (?, ?, ?, ?, ?)")
            .bind(...skus).all<{ id: number, sku: string, name: string }>();

        const skuToId = new Map(products.map(p => [p.sku, p.id]));
        // Reverse map for lookup by name if needed
        const nameToId = new Map(products.map(p => [p.name.toLowerCase(), p.id]));

        // 2. Mapping from Order Number to SKU (extracted from scratchpad.md)
        const orderToSku: Record<string, string[]> = {
            "12076": ["HCS-ADULT", "HCS-ADV-ELITE"],
            "12087": ["HCS-ADV-PRO"],
            "12092": ["HCS-ADULT"],
            "12093": ["HCS-NYLANDER"],
            "12094": ["HCS-KEMPE"],
            "12095": ["HCS-ADULT"],
            "12096": ["HCS-NYLANDER"],
            "12097": ["HCS-NYLANDER"],
            "0": ["HCS-NYLANDER"],
            "12098": ["HCS-NYLANDER"],
            "12099": ["HCS-KEMPE"],
            "12100": ["HCS-ADV-PRO"],
            "12101": ["HCS-NYLANDER"],
            "12102": ["HCS-KEMPE"],
            "12103": ["HCS-ADV-PRO"],
            "12104": ["HCS-NYLANDER"]
        };

        // 3. Find all purchases imported via CSV that are mapped to product_id 1
        const { results: importedPurchases } = await db.prepare(`
            SELECT p.id, p.raw_email_id, r.form_response_json
            FROM Purchases p
            LEFT JOIN Registrations r ON r.purchase_id = p.id
            WHERE p.raw_email_id LIKE 'csv_import_%' AND p.product_id = 1
        `).all<{ id: number, raw_email_id: string, form_response_json?: string }>();

        const updates = [];
        const updateSummary = [];
        const usedOrderIndices = new Map<string, number>();

        for (const purchase of importedPurchases) {
            const parts = purchase.raw_email_id.split('_');
            const orderNumber = parts[parts.length - 1];

            let TargetProductId = null;
            let source = "";

            // Strategy A: Check if they filled out the form (most reliable)
            if (purchase.form_response_json) {
                try {
                    const formData = JSON.parse(purchase.form_response_json);
                    // The form stores it in 'camp_applied' or similar
                    const campApplied = formData.camp_applied || "";

                    // Try to match by product name
                    for (const [prodName, prodId] of nameToId.entries()) {
                        if (campApplied.toLowerCase().includes(prodName)) {
                            TargetProductId = prodId;
                            source = "Form Data";
                            break;
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse form response", e);
                }
            }

            // Strategy B: Use the hardcoded mapping from Order Number
            if (!TargetProductId && orderToSku[orderNumber]) {
                const possibleSkus = orderToSku[orderNumber];
                const currentIndex = usedOrderIndices.get(orderNumber) || 0;

                if (currentIndex < possibleSkus.length) {
                    const sku = possibleSkus[currentIndex];
                    TargetProductId = skuToId.get(sku) || null;
                    source = "Order Mapping";
                    usedOrderIndices.set(orderNumber, currentIndex + 1);
                }
            }

            if (TargetProductId) {
                updates.push(db.prepare("UPDATE Purchases SET product_id = ? WHERE id = ?").bind(TargetProductId, purchase.id));
                updateSummary.push({
                    purchaseId: purchase.id,
                    orderNumber,
                    TargetProductId,
                    source
                });
            }
        }

        if (updates.length > 0) {
            await db.batch(updates);
        }

        return NextResponse.json({
            success: true,
            summary: {
                scanned: importedPurchases.length,
                updated: updates.length
            },
            details: updateSummary
        });

    } catch (e: any) {
        console.error(`[Admin API] Correction Error:`, e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

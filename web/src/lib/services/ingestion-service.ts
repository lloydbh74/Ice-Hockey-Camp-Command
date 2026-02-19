import { D1Database } from "@cloudflare/workers-types";
import { getDb, getProductBySku, getAdminEmails, logIngestion } from '@/lib/db';
import { EmailService } from './email-service';
import { z } from "zod";

export const IngestionSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    orderReference: z.string().min(1, "Order Reference is required"),
    guardianEmail: z.string().email("Invalid guardian email"),
    guardianName: z.string().min(1, "Guardian name is required"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    totalAmount: z.number().min(0, "Total amount must be at least 0"),
    currency: z.string().min(1, "Currency is required"),
    orderDate: z.string().min(1, "Order date is required"),
    products: z.array(z.object({
        rawDescription: z.string().min(1, "Product description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1")
    })).min(1, "At least one product is required"),
    rawEmailId: z.string().min(1, "Raw email ID is required"),
    rawSource: z.string().optional()
});

export type IngestionPayload = z.infer<typeof IngestionSchema>;

export class IngestionService {
    static extractSku(description: string): string | null {
        // Matches [SKU: SOME-SKU] or just the SKU if it's the whole string
        const match = description.match(/\[SKU:\s*([^\]]+)\]/i);
        return match ? match[1].trim() : description.trim();
    }

    static async processIngestion(db: D1Database, rawPayload: any) {
        // 1. Validate Payload
        const validation = IngestionSchema.safeParse(rawPayload);
        if (!validation.success) {
            const errorMessages = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
            // Log the validation failure
            await logIngestion(db, {
                raw_email_id: rawPayload?.rawEmailId || 'validation-error',
                status: 'failure',
                message: 'Validation failed',
                details: { errors: errorMessages, rawPayload }
            });
            throw {
                status: 400,
                message: "Validation failed",
                details: errorMessages
            };
        }
        const payload = validation.data;

        try {
            // 2. Idempotency Check
            const existingPurchase = await db.prepare("SELECT id FROM Purchases WHERE raw_email_id = ?").bind(payload.rawEmailId).first();
            if (existingPurchase) {
                return { success: true, alreadyProcessed: true, purchaseId: (existingPurchase as any).id };
            }

            // 3. Resolve Guardian
            await db.prepare("INSERT OR IGNORE INTO Guardians (email, full_name) VALUES (?, ?)").bind(payload.guardianEmail.toLowerCase(), payload.guardianName).run();
            const guardian = await db.prepare("SELECT id FROM Guardians WHERE email = ?").bind(payload.guardianEmail.toLowerCase()).first<{ id: number }>();
            if (!guardian) throw new Error("Failed to resolve guardian");

            // 4. Map and Validate all products before any writes
            const batchedStatements = [];
            const productMappings = [];

            for (const item of payload.products) {
                const sku = this.extractSku(item.rawDescription);
                if (!sku) throw { status: 400, message: `Invalid product description: ${item.rawDescription}` };

                const mapping = await getProductBySku(db, sku);
                if (!mapping) throw { status: 400, message: `Unknown product SKU: ${sku}` };

                productMappings.push({ mapping, quantity: item.quantity });
            }

            // 5. Prepare Batch
            for (const { mapping, quantity } of productMappings) {
                const registrationToken = crypto.randomUUID();
                batchedStatements.push(
                    db.prepare(`
                        INSERT INTO Purchases (
                            guardian_id, camp_id, product_id, quantity, registration_state, 
                            purchase_timestamp, raw_email_id, price_at_purchase, currency,
                            registration_token
                        ) VALUES (?, ?, ?, ?, 'invited', ?, ?, ?, ?, ?)
                    `).bind(
                        guardian.id,
                        mapping.campId,
                        mapping.product.id,
                        quantity,
                        payload.orderDate || new Date().toISOString(),
                        payload.rawEmailId,
                        mapping.price,
                        payload.currency || 'GBP',
                        registrationToken
                    )
                );

                // 5.5. Trigger first invitation email
                // Note: In a full worker environment, we might use a Queue or wait for the batch to succeed.
                // For MVP, we trigger it here.
                const emailResult = await EmailService.sendRegistrationInvitation(db, {
                    to: payload.guardianEmail,
                    guardianName: payload.guardianName,
                    productName: mapping.product.name,
                    token: registrationToken
                });

                if (!emailResult.success) {
                    console.warn(`[Ingestion] Failed to send invitation email: ${emailResult.error}`);
                }
            }

            // 6. Add Log entry to the same batch for atomicity
            batchedStatements.push(
                db.prepare(`
                    INSERT INTO IngestionLogs (raw_email_id, status, message, details)
                    VALUES (?, ?, ?, ?)
                `).bind(
                    payload.rawEmailId,
                    'success',
                    `Successfully processed order ${payload.orderId}`,
                    JSON.stringify({ guardianId: guardian.id, productCount: productMappings.length })
                )
            );

            // 7. Execute Batch
            const results = await db.batch(batchedStatements);

            // Collect purchase IDs (they are in order before the last log statement)
            const purchaseIds = results.slice(0, productMappings.length).map((r: any) => r.meta.last_row_id);

            return {
                success: true,
                purchaseIds,
                guardianId: guardian.id
            };
        } catch (error: any) {
            // Log Failure (not batched since the main process failed)
            await logIngestion(db, {
                raw_email_id: payload.rawEmailId,
                status: 'failure',
                message: error.message || 'Unknown ingestion error',
                details: { orderId: payload.orderId, payload, error: error.details || error }
            });
            throw error;
        }
    }
}

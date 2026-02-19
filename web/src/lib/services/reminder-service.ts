import { D1Database } from "@cloudflare/workers-types";
import { EmailService } from "./email-service";

export class ReminderService {
    /**
     * Scans for incomplete registrations and sends reminder emails based on camp settings.
     */
    static async processReminders(db: D1Database) {
        console.log("[ReminderService] Starting reminder scan...");

        // 1. Get all active camps where reminders are either explicitly enabled OR no settings exist yet (default to enabled)
        const campSettingsRes = await db.prepare(`
            SELECT 
                COALESCE(cs.reminders_enabled, 1) as reminders_enabled,
                COALESCE(cs.reminder_cadence_days, 7) as reminder_cadence_days,
                COALESCE(cs.max_reminders, 3) as max_reminders,
                c.id as camp_id,
                c.name as camp_name
            FROM Camps c
            LEFT JOIN CampSettings cs ON c.id = cs.camp_id
            WHERE c.status != 'archived'
            AND COALESCE(cs.reminders_enabled, 1) = 1
        `).all();

        if (!campSettingsRes.results) return;

        for (const setting of campSettingsRes.results as any[]) {
            const { camp_id, reminder_cadence_days, max_reminders } = setting;

            // 2. Find purchases for this camp that are NOT completed
            const pendingPurchasesRes = await db.prepare(`
                SELECT p.*, g.full_name as guardian_name, g.email as guardian_email, pr.name as product_name
                FROM Purchases p
                JOIN Guardians g ON p.guardian_id = g.id
                JOIN Products pr ON p.product_id = pr.id
                WHERE p.camp_id = ? 
                AND p.registration_state IN ('uninvited', 'invited', 'in_progress')
            `).bind(camp_id).all();

            if (!pendingPurchasesRes.results) continue;

            for (const purchase of pendingPurchasesRes.results as any[]) {
                // 3. Count reminders already sent for this purchase
                const countRes = await db.prepare("SELECT COUNT(*) as count FROM Reminders WHERE purchase_id = ?")
                    .bind(purchase.id)
                    .first<{ count: number }>();

                const count = countRes?.count || 0;

                if (count >= max_reminders) {
                    console.log(`[ReminderService] Max reminders reached for Purchase ${purchase.id}`);
                    continue;
                }

                // 4. Check if we should send a reminder based on cadence
                const lastEventTime = await this.getLastEventTime(db, purchase);
                const daysSinceLastEvent = (Date.now() - new Date(lastEventTime).getTime()) / (1000 * 60 * 60 * 24);

                if (daysSinceLastEvent >= reminder_cadence_days) {
                    console.log(`[ReminderService] Sending reminder to ${purchase.guardian_email} for Purchase ${purchase.id}`);

                    const result = await EmailService.sendRegistrationReminder(db, {
                        to: purchase.guardian_email,
                        guardianName: purchase.guardian_name,
                        productName: purchase.product_name,
                        token: purchase.registration_token
                    });

                    if (result.success) {
                        // 5. Record the reminder
                        // Generate a unique token for the log entry to avoid UNIQUE constraint violation on Reminders table
                        const reminderLogToken = `rem_${purchase.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

                        await db.prepare("INSERT INTO Reminders (purchase_id, sent_at, token, expires_at) VALUES (?, CURRENT_TIMESTAMP, ?, ?)")
                            .bind(purchase.id, reminderLogToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
                            .run();

                        // Update purchase state if it was uninvited
                        if (purchase.registration_state === 'uninvited') {
                            await db.prepare("UPDATE Purchases SET registration_state = 'invited' WHERE id = ?").bind(purchase.id).run();
                        }
                    }
                }
            }
        }

        console.log("[ReminderService] Reminder scan complete.");
    }

    private static async getLastEventTime(db: D1Database, purchase: any): Promise<string> {
        const lastReminder = await db.prepare("SELECT sent_at FROM Reminders WHERE purchase_id = ? ORDER BY sent_at DESC LIMIT 1")
            .bind(purchase.id)
            .first<{ sent_at: string }>();

        return lastReminder ? lastReminder.sent_at : purchase.purchase_timestamp;
    }
}

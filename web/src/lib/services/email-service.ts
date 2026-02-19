import { D1Database } from "@cloudflare/workers-types";

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export class EmailService {
    static async sendEmail(db: D1Database, options: EmailOptions): Promise<{ success: boolean; error?: string }> {
        try {
            const { results } = await db.prepare("SELECT key, value FROM SystemSettings WHERE key IN ('brevo_api_key', 'support_email')").all();

            const settings: Record<string, string> = {};
            results?.forEach((row: any) => settings[row.key] = row.value);

            if (!settings.brevo_api_key) {
                console.warn("[EmailService] No Brevo API key configured, falling back to mock logs.");
                console.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
                return { success: true };
            }

            const from = settings.support_email || 'hockeyschool@chelmsfordiha.co.uk';

            console.log(`[EmailService] Sending email via Brevo to ${options.to}`);

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': settings.brevo_api_key,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sender: { email: from },
                    to: [{ email: options.to }],
                    subject: options.subject,
                    htmlContent: options.html,
                    textContent: options.text,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`[EmailService] Brevo API error (${response.status}): ${errorBody}`);
                return { success: false, error: `Brevo API error (${response.status}): ${errorBody}` };
            }

            const result = await response.json() as any;
            console.log(`[EmailService] Email sent successfully. MessageId: ${result.messageId}`);
            return { success: true };
        } catch (error: any) {
            console.error("[EmailService] Error:", error);
            return { success: false, error: error.message };
        }
    }

    static async sendRegistrationInvitation(db: D1Database, data: {
        to: string,
        guardianName: string,
        productName: string,
        token: string
    }): Promise<{ success: boolean; error?: string }> {
        const appUrl = await this.resolveAppUrl(db);
        const registrationUrl = `${appUrl}/registration/${data.token}`;

        return await this.sendEmail(db, {
            to: data.to,
            subject: `Action Required: Register for ${data.productName}`,
            text: `Hi ${data.guardianName},\n\nThank you for your purchase of ${data.productName}. Please complete the player registration form here: ${registrationUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0f172a;">Welcome to Swedish Camp!</h2>
                    <p>Hi <strong>${data.guardianName}</strong>,</p>
                    <p>Thank you for your purchase of <strong>${data.productName}</strong>. To ensure everything is ready for your player, please complete the final registration step below:</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${registrationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Complete Registration</a>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link: <br/> ${registrationUrl}</p>
                </div>
            `
        });
    }

    static async sendRegistrationReminder(db: D1Database, data: {
        to: string,
        guardianName: string,
        productName: string,
        token: string
    }): Promise<{ success: boolean; error?: string }> {
        const appUrl = await this.resolveAppUrl(db);
        const registrationUrl = `${appUrl}/registration/${data.token}`;

        return await this.sendEmail(db, {
            to: data.to,
            subject: `Reminder: Complete your ${data.productName} registration`,
            text: `Hi ${data.guardianName},\n\nThis is a friendly reminder to complete your player registration for ${data.productName}: ${registrationUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0f172a;">Friendly Reminder</h2>
                    <p>Hi <strong>${data.guardianName}</strong>,</p>
                    <p>We're looking forward to seeing you at <strong>${data.productName}</strong>! We noticed your player registration is still incomplete.</p>
                    <p>Please take a moment to finish it now so we can finalize logistics:</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${registrationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Finish Registration Now</a>
                    </div>
                </div>
            `
        });
    }

    static async sendAdminMagicLink(db: D1Database, data: {
        to: string,
        token: string
    }): Promise<{ success: boolean; error?: string }> {
        const appUrl = await this.resolveAppUrl(db);
        const loginUrl = `${appUrl}/api/admin/auth/verify?token=${data.token}`;

        return await this.sendEmail(db, {
            to: data.to,
            subject: `Admin Login - Swedish Camp Command`,
            text: `Click the link to log in to the admin dashboard: ${loginUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0f172a;">Swedish Camp Admin Login</h2>
                    <p>Click the button below to sign in to the Swedish Camp Command dashboard. This link will expire in 15 minutes.</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${loginUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Sign In to Dashboard</a>
                    </div>
                </div>
            `
        });
    }

    private static async resolveAppUrl(db: D1Database): Promise<string> {
        const result = await db.prepare("SELECT value FROM SystemSettings WHERE key = 'app_url'").first<string>('value');
        if (result) return result.replace(/\/$/, ''); // Remove trailing slash if present

        return (process.env.NEXT_PUBLIC_APP_URL || 'https://ice-hockey-camp-command.pages.dev').replace(/\/$/, '');
    }
}

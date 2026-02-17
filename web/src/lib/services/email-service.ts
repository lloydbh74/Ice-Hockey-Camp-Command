import { D1Database } from "@cloudflare/workers-types";

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export class EmailService {
    /**
     * Sends an email using the configured SMTP settings in SystemSettings.
     * Note: On Cloudflare Workers, this typically requires an external API 
     * (Postmark, Resend, or a custom SMTP Relay worker) unless using a 
     * specific DMARC-compliant integration.
     */
    static async sendEmail(db: D1Database, options: EmailOptions): Promise<boolean> {
        try {
            // 1. Fetch SMTP settings
            const { results } = await db.prepare("SELECT key, value FROM SystemSettings WHERE key IN ('smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'support_email')").all();

            const settings: Record<string, string> = {};
            results?.forEach((row: any) => settings[row.key] = row.value);

            if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
                console.warn("[EmailService] Missing SMTP credentials, falling back to mock logs.");
                console.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
                return true;
            }

            const host = settings.smtp_host;
            const port = parseInt(settings.smtp_port || '587');
            const user = settings.smtp_username;
            const pass = settings.smtp_password;
            const from = settings.support_email || user;

            console.log(`[EmailService] Attempting real SMTP delivery to ${options.to} via ${host}:${port}`);

            // Cloudflare Edge TCP Socket sending
            // We use a simplified SMTP flow: HELO -> AUTH LOGIN -> MAIL FROM -> RCPT TO -> DATA -> QUIT
            // Note: Cloudflare's connect() API requires 'connect_direct' permissions in wrangler.toml

            // DYNAMIC IMPORT FIX: Using a variable prevents Webpack from statically analyzing the protocol
            const SOCKET_MODULE = `cloudflare:sockets`;
            const { connect } = await import(SOCKET_MODULE);
            const socket = connect({ hostname: host, port: port });
            const writer = socket.writable.getWriter();
            const reader = socket.readable.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            async function sendCommand(cmd: string) {
                await writer.write(encoder.encode(cmd + "\r\n"));
                const { value } = await reader.read();
                const response = decoder.decode(value);
                console.log(`[SMTP] > ${cmd} | < ${response.trim()}`);
                return response;
            }

            // Initial greeting
            const { value: initialResponse } = await reader.read();
            console.log(`[SMTP] Connect: ${decoder.decode(initialResponse).trim()}`);

            await sendCommand(`EHLO ${host}`);

            // AUTH LOGIN
            await sendCommand("AUTH LOGIN");
            await sendCommand(btoa(user));
            await sendCommand(btoa(pass));

            // Transaction
            await sendCommand(`MAIL FROM:<${from}>`);
            await sendCommand(`RCPT TO:<${options.to}>`);

            // DATA
            await writer.write(encoder.encode("DATA\r\n"));
            await reader.read(); // Wait for 354

            const message = [
                `From: ${from}`,
                `To: ${options.to}`,
                `Subject: ${options.subject}`,
                `Content-Type: text/html; charset=UTF-8`,
                `MIME-Version: 1.0`,
                ``,
                options.html,
                `.`
            ].join("\r\n");

            await sendCommand(message);
            await sendCommand("QUIT");

            await writer.close();
            await reader.cancel();

            return true;
        } catch (error: any) {
            console.error("[EmailService] SMTP Error:", error);
            // Don't crash the whole worker, just return false
            return false;
        }
    }

    static async sendRegistrationInvitation(db: D1Database, data: {
        to: string,
        guardianName: string,
        productName: string,
        token: string
    }) {
        const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registration/${data.token}`;

        return await this.sendEmail(db, {
            to: data.to,
            subject: `Action Required: Register for ${data.productName}`,
            text: `Hi ${data.guardianName},\n\nThank you for your purchase of ${data.productName}. Please complete the player registration form here: ${registrationUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
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
    }) {
        const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registration/${data.token}`;

        return await this.sendEmail(db, {
            to: data.to,
            subject: `Reminder: Complete your ${data.productName} registration`,
            text: `Hi ${data.guardianName},\n\nThis is a friendly reminder to complete your player registration for ${data.productName}: ${registrationUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
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
    }) {
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/auth/verify?token=${data.token}`;

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
}

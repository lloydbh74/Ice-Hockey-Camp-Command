import { D1Database } from "@cloudflare/workers-types";
// @ts-ignore - cloudflare:sockets is a built-in module
import { connect } from 'cloudflare:sockets';

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export class EmailService {
    /**
     * Sends an email using the configured SMTP settings in SystemSettings.
     * Returns a result object with success status and optional error message.
     */
    static async sendEmail(db: D1Database, options: EmailOptions): Promise<{ success: boolean; error?: string }> {
        let socket: any;
        try {
            // 1. Fetch SMTP settings
            const { results } = await db.prepare("SELECT key, value FROM SystemSettings WHERE key IN ('smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'support_email')").all();

            const settings: Record<string, string> = {};
            results?.forEach((row: any) => settings[row.key] = row.value);

            if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
                console.warn("[EmailService] Missing SMTP credentials, falling back to mock logs.");
                console.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
                return { success: true };
            }

            const host = settings.smtp_host;
            const port = parseInt(settings.smtp_port || '587');
            const user = settings.smtp_username;
            const pass = settings.smtp_password;
            const from = settings.support_email || user;

            console.log(`[EmailService] Attempting real SMTP delivery to ${options.to} via ${host}:${port}`);

            // Check if socket capability is available
            if (typeof connect !== 'function') {
                throw new Error("Cloudflare TCP sockets connect() function not found. Please ensure 'nodejs_compat' is enabled in your Cloudflare project settings.");
            }

            socket = connect({ hostname: host, port: port });
            let writer = socket.writable.getWriter();
            let reader = socket.readable.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            async function receive() {
                const { value } = await reader.read();
                if (!value) throw new Error("Connection closed unexpectedly");
                const resp = decoder.decode(value);
                console.log(`[SMTP] < ${resp.trim()}`);
                return resp;
            }

            async function sendCommand(cmd: string) {
                console.log(`[SMTP] > ${cmd.startsWith("AUTH") || cmd.length > 20 ? cmd.split(" ")[0] : cmd}`);
                await writer.write(encoder.encode(cmd + "\r\n"));
                return await receive();
            }

            // Initial greeting
            const initial = await receive();
            if (!initial.startsWith("220")) throw new Error(`Invalid greeting: ${initial}`);

            await sendCommand(`EHLO ${host}`);

            // STARTTLS for port 587
            if (port === 587) {
                const startTlsResp = await sendCommand("STARTTLS");
                if (startTlsResp.startsWith("220")) {
                    console.log("[SMTP] Upgrading to TLS...");
                    const secureSocket = socket.startTls();

                    // After startTls, old reader/writer are invalid
                    writer = secureSocket.writable.getWriter();
                    reader = secureSocket.readable.getReader();

                    // HELO again over TLS
                    await sendCommand(`EHLO ${host}`);
                } else {
                    console.warn("[SMTP] STARTTLS not supported or failed, proceeding in cleartext (risky)");
                }
            }

            // AUTH LOGIN
            const authResp = await sendCommand("AUTH LOGIN");
            if (!authResp.startsWith("334")) throw new Error(`AUTH LOGIN failed: ${authResp}`);

            await sendCommand(btoa(user));
            const passResp = await sendCommand(btoa(pass));
            if (!passResp.startsWith("235")) throw new Error(`Authentication failed: ${passResp}`);

            // Transaction
            await sendCommand(`MAIL FROM:<${from}>`);
            const rcptResp = await sendCommand(`RCPT TO:<${options.to}>`);
            if (!rcptResp.startsWith("250")) throw new Error(`Recipient rejected: ${rcptResp}`);

            // DATA
            const dataResp = await sendCommand("DATA");
            if (!dataResp.startsWith("354")) throw new Error(`DATA command failed: ${dataResp}`);

            const message = [
                `From: ${from}`,
                `To: ${options.to}`,
                `Subject: ${options.subject}`,
                `Content-Type: text/html; charset=UTF-8`,
                `MIME-Version: 1.0`,
                `Date: ${new Date().toUTCString()}`,
                ``,
                options.html,
                `.`
            ].join("\r\n");

            const finalResp = await sendCommand(message);
            if (!finalResp.startsWith("250")) throw new Error(`Message delivery failed: ${finalResp}`);

            await sendCommand("QUIT");
            return { success: true };
        } catch (error: any) {
            console.error("[EmailService] SMTP Error:", error);
            return { success: false, error: error.message };
        } finally {
            if (socket) {
                try { socket.close(); } catch (e) { }
            }
        }
    }

    static async sendRegistrationInvitation(db: D1Database, data: {
        to: string,
        guardianName: string,
        productName: string,
        token: string
    }): Promise<{ success: boolean; error?: string }> {
        const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registration/${data.token}`;

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
        const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registration/${data.token}`;

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

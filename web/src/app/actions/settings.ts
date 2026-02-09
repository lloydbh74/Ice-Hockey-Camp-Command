'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
    const db = await getDb();
    // Fetch all settings
    const { results } = await db.prepare('SELECT * FROM SystemSettings').all();
    return results;
}

export async function updateSystemSetting(key: string, value: string, description?: string) {
    const db = await getDb();

    if (description) {
        await db.prepare(`
      INSERT INTO SystemSettings (key, value, description, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `).bind(key, value, description).run();
    } else {
        await db.prepare(`
        INSERT INTO SystemSettings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP
      `).bind(key, value).run();
    }

    revalidatePath('/admin/settings/system');
}

export async function addAdminEmail(email: string) {
    const db = await getDb();
    const key = 'admin_emails';

    // 1. Get existing emails
    const existing = await db.prepare('SELECT value FROM SystemSettings WHERE key = ?').bind(key).first();

    let emails: string[] = [];
    if (existing && typeof existing.value === 'string') {
        try {
            emails = JSON.parse(existing.value);
        } catch (e) {
            // Fallback if not JSON
            emails = [];
        }
    }

    // 2. Add new email if not exists
    if (!emails.includes(email)) {
        emails.push(email);
        await updateSystemSetting(key, JSON.stringify(emails), 'List of emails allowed to verify login magic links.');
    }
}

export async function removeAdminEmail(email: string) {
    const db = await getDb();
    const key = 'admin_emails';

    // 1. Get existing emails
    const existing = await db.prepare('SELECT value FROM SystemSettings WHERE key = ?').bind(key).first();

    let emails: string[] = [];
    if (existing && typeof existing.value === 'string') {
        try {
            emails = JSON.parse(existing.value);
        } catch (e) {
            emails = [];
        }
    }

    // 2. Filter out
    const newEmails = emails.filter(e => e !== email);
    await updateSystemSetting(key, JSON.stringify(newEmails), 'List of emails allowed to verify login magic links.');
}

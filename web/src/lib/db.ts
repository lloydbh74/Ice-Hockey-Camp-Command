import { getRequestContext } from '@cloudflare/next-on-pages';



interface Env {
    DB: D1Database;
}

export async function getDb() {
    const context = getRequestContext();
    if (!context || !context.env) {
        throw new Error('D1 Database context is not available. Ensure you are running on Cloudflare Edge Runtime.');
    }
    const { env } = context as unknown as { env: Env };
    return env.DB;
}

// --- Types ---
export interface Camp {
    id: number;
    name: string;
    year: number;
    status: 'active' | 'deactivated' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    sku?: string;
    description?: string;
    base_price: number;
    status: 'active' | 'deactivated';
    form_template_id?: number;
    created_at: string;
    updated_at: string;
}

export interface CampProduct {
    id: number;
    camp_id: number;
    product_id: number;
    price: number;
    status: 'active' | 'inactive';
}

export interface CampDay {
    id: number;
    camp_id: number;
    date: string;
    label?: string;
    status: 'active' | 'archived';
}

export interface Stream {
    id: number;
    camp_id: number;
    name: string;
    status: 'active' | 'archived';
}

export interface Session {
    id: number;
    camp_day_id: number;
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
}

export interface SessionStream {
    session_id: number;
    stream_id: number;
}

export type Purchase = PurchaseRow;

// Internal DB Row type match
interface PurchaseRow {
    id: number;
    guardian_id: number;
    camp_id: number;
    product_id: number;
    quantity: number;
    registration_state: 'uninvited' | 'invited' | 'in_progress' | 'completed';
    purchase_timestamp: string;
    raw_email_id: string;
    price_at_purchase: number;
    currency: string;
    registration_token?: string;
    registration_data?: string;
}

// --- Spec 003: Email Ingestion Helpers ---

export async function getProductBySku(db: D1Database, sku: string): Promise<{ product: Product; campId: number; price: number } | null> {
    // Find product by SKU and get its associated camp and price from CampProducts
    // We assume a SKU uniquely identifies a specific product-camp offering for ingestion
    const result = await db.prepare(`
        SELECT p.*, cp.camp_id, cp.price
        FROM Products p
        INNER JOIN CampProducts cp ON p.id = cp.product_id
        WHERE p.sku = ?
        LIMIT 1
    `).bind(sku).first<any>();

    if (!result) return null;

    const { camp_id, price, ...productData } = result;
    return {
        product: productData as Product,
        campId: camp_id,
        price: price || 0
    };
}

export async function getAdminEmails(db: D1Database): Promise<string[]> {
    const result = await db.prepare("SELECT value FROM SystemSettings WHERE key = 'admin_emails'").first<string>('value');
    if (!result) return [];
    return result.split(',').map(e => e.trim());
}

export async function getCampByFuzzyName(db: D1Database, name: string): Promise<{ id: number; name: string } | null> {
    // Enhanced fuzzy search with LIKE
    return await db.prepare("SELECT id, name FROM Camps WHERE name LIKE ? AND status != 'archived' LIMIT 1")
        .bind(`%${name}%`)
        .first<{ id: number; name: string }>();
}

export async function createPurchaseTransactions(
    db: D1Database,
    data: {
        guardianEmail: string;
        guardianName: string;
        campId: number;
        amount: number;
        rawEmailId: string
    }
) {
    // 1. Upsert Guardian
    // We use INSERT OR IGNORE then SELECT to handle the ID
    await db.prepare("INSERT OR IGNORE INTO Guardians (email, full_name) VALUES (?, ?)").bind(data.guardianEmail, data.guardianName).run();
    const guardian = await db.prepare("SELECT id FROM Guardians WHERE email = ?").bind(data.guardianEmail).first<{ id: number }>();

    if (!guardian) throw new Error("Failed to resolve Guardian ID");

    // 3. Resolve Product & Price
    // For this MVP, let's assume Product ID 1 is "Standard Registration" or find from CampProducts
    // In a real scenario, we'd lookup based on CampProduct association
    const productId = 1;

    // Fetch current price for this product at this camp
    const campProduct = await db.prepare("SELECT price FROM CampProducts WHERE camp_id = ? AND product_id = ?")
        .bind(data.campId, productId)
        .first<{ price: number }>();

    const pricePaid = campProduct?.price || 0;

    // 4. Create Purchase with Snapshot Price
    await db.prepare(`
        INSERT INTO Purchases (guardian_id, camp_id, product_id, quantity, registration_state, purchase_timestamp, raw_email_id, price_at_purchase, currency)
        VALUES (?, ?, ?, 1, 'uninvited', datetime('now'), ?, ?, 'GBP')
    `).bind(guardian.id, data.campId, productId, data.rawEmailId, pricePaid).run();
}

// --- Spec 004: Form Builder ---

export async function getFormVariables(db: D1Database, campId: number): Promise<string[]> {
    // Determine which variables (custom fields) are available for this camp's forms
    // For now, return a static list or fetch from CampSettings if they exist
    return ["first_name", "last_name", "dob", "medical_notes", "jersey_size"];
}

export async function saveFormTemplate(db: D1Database, template: { name: string; schema: string; description?: string }) {
    return await db.prepare("INSERT INTO FormTemplates (name, schema_json, description) VALUES (?, ?, ?)")
        .bind(template.name, template.schema, template.description || "")
        .run();
}

export async function publishFormVersion(
    db: D1Database,
    data: { productId: number; schema: string; version: string; changelog: string; versionType: 'patch' | 'minor' | 'major' }
) {
    // 1. Check if a form exists for this product
    const existing = await db.prepare("SELECT id FROM Forms WHERE product_id = ?").bind(data.productId).first<{ id: number }>();

    // 2. If exists, we update (overwrite) but log the version change. 
    // Ideally we would INSERT a new row if we wanted full history, but for MVP we alter the current 'Active' row
    // Wait, the requirement was "Allow the user to re-open previous versions".
    // This implies storing history.
    // So we should INSERT a new row for every version, and marked is_published = 1 only for the active one.

    // Un-publish previous active forms for this product
    await db.prepare("UPDATE Forms SET is_published = 0 WHERE product_id = ?").bind(data.productId).run();

    // Insert new version
    return await db.prepare(`
        INSERT INTO Forms (product_id, name, schema_json, version, changelog, is_published)
        VALUES (?, ?, ?, ?, ?, 1)
    `)
        .bind(data.productId, `Form v${data.version}`, data.schema, data.version, data.changelog)
        .run();
}

export async function getActiveForm(db: D1Database, productId: number) {
    // 1. Try to find a specifically published form for this product
    const form = await db.prepare("SELECT * FROM Forms WHERE product_id = ? AND is_published = 1 ORDER BY id DESC").bind(productId).first<any>();
    if (form) return form;

    // 2. Fallback: Check if the product has a default form template assigned
    return await db.prepare(`
        SELECT ft.id, ft.name, ft.schema_json, 'template' as source
        FROM Products p
        JOIN FormTemplates ft ON p.form_template_id = ft.id
        WHERE p.id = ?
    `).bind(productId).first<any>();
}

export async function getFormHistory(db: D1Database, productId: number) {
    return await db.prepare("SELECT * FROM Forms WHERE product_id = ? ORDER BY id DESC").bind(productId).all();
}

// --- Spec 002: Camp & Product Management ---

export async function listCamps(db: D1Database, includeArchived = false) {
    const sql = includeArchived
        ? "SELECT * FROM Camps ORDER BY year DESC, name ASC"
        : "SELECT * FROM Camps WHERE status != 'archived' ORDER BY year DESC, name ASC";
    return await db.prepare(sql).all<Camp>();
}

export async function createCamp(db: D1Database, data: { name: string; year: number }) {
    return await db.prepare("INSERT INTO Camps (name, year, status) VALUES (?, ?, 'active')")
        .bind(data.name, data.year)
        .run();
}

export async function getCampById(db: D1Database, id: number) {
    return await db.prepare("SELECT * FROM Camps WHERE id = ?").bind(id).first<Camp>();
}

export async function updateCamp(db: D1Database, id: number, data: Partial<Camp>) {
    const allowedFields = ['name', 'year', 'status'];
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
            sets.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (sets.length === 0) return;

    values.push(id);
    return await db.prepare(`UPDATE Camps SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(...values)
        .run();
}

export async function listProducts(db: D1Database) {
    return await db.prepare("SELECT * FROM Products WHERE status = 'active' ORDER BY name ASC").all<Product>();
}

export async function createProduct(db: D1Database, data: { name: string; description?: string; base_price: number; form_template_id?: number }) {
    return await db.prepare("INSERT INTO Products (name, description, base_price, form_template_id, status) VALUES (?, ?, ?, ?, 'active')")
        .bind(data.name, data.description || null, data.base_price, data.form_template_id || null)
        .run();
}

export async function getCampProducts(db: D1Database, campId: number) {
    return await db.prepare(`
        SELECT 
            cp.id, 
            cp.camp_id, 
            cp.product_id, 
            cp.price, 
            p.name as product_name, 
            p.description as product_description
        FROM CampProducts cp
        JOIN Products p ON cp.product_id = p.id
        WHERE cp.camp_id = ?
    `).bind(campId).all();
}

export async function associateProductWithCamp(db: D1Database, data: { campId: number; productId: number; price: number }) {
    // 1. Get product details to check if it's a primary product (has form_template_id)
    const product = await db.prepare("SELECT * FROM Products WHERE id = ?").bind(data.productId).first<Product>();

    // 2. Associate product with camp
    const result = await db.prepare("INSERT INTO CampProducts (camp_id, product_id, price) VALUES (?, ?, ?)")
        .bind(data.campId, data.productId, data.price)
        .run();

    // 3. If it's a primary product, ensure a matching stream exists
    if (product && product.form_template_id) {
        // Check if stream already exists
        const existingStream = await db.prepare("SELECT * FROM Streams WHERE camp_id = ? AND name = ? AND status = 'active'")
            .bind(data.campId, product.name)
            .first();

        if (!existingStream) {
            await db.prepare("INSERT INTO Streams (camp_id, name) VALUES (?, ?)")
                .bind(data.campId, product.name)
                .run();
        }
    }

    return result;
}

export async function removeProductFromCamp(db: D1Database, campId: number, cpId: number) {
    return await db.prepare("DELETE FROM CampProducts WHERE id = ? AND camp_id = ?")
        .bind(cpId, campId)
        .run();
}

export async function updateCampProductPrice(db: D1Database, campId: number, cpId: number, newPrice: number) {
    return await db.prepare("UPDATE CampProducts SET price = ? WHERE id = ? AND camp_id = ?")
        .bind(newPrice, cpId, campId)
        .run();
}

export async function listAllPurchases(db: D1Database, query?: string, limit?: number) {
    let sql = `
        SELECT p.*, p.price_at_purchase as amount, g.full_name as guardian_name, g.email as guardian_email, pr.name as product_name, c.name as camp_name,
               pl.first_name as player_first_name, pl.last_name as player_last_name
        FROM Purchases p
        JOIN Guardians g ON p.guardian_id = g.id
        JOIN Products pr ON p.product_id = pr.id
        JOIN Camps c ON p.camp_id = c.id
        LEFT JOIN Registrations r ON p.id = r.purchase_id
        LEFT JOIN Players pl ON r.player_id = pl.id
    `;
    const params: any[] = [];

    if (query) {
        sql += ` WHERE (g.full_name LIKE ? OR g.email LIKE ? OR pl.first_name LIKE ? OR pl.last_name LIKE ?)`;
        const q = `%${query}%`;
        params.push(q, q, q, q);
    }

    sql += ` ORDER BY p.purchase_timestamp DESC`;
    if (limit) {
        sql += ` LIMIT ?`;
        params.push(limit);
    }
    return await db.prepare(sql).bind(...params).all();
}

export async function listPurchasesByCamp(db: D1Database, campId: number, query?: string, limit?: number) {
    let sql = `
        SELECT p.*, p.price_at_purchase as amount, g.full_name as guardian_name, g.email as guardian_email, pr.name as product_name,
               pl.first_name as player_first_name, pl.last_name as player_last_name
        FROM Purchases p
        JOIN Guardians g ON p.guardian_id = g.id
        JOIN Products pr ON p.product_id = pr.id
        LEFT JOIN Registrations r ON p.id = r.purchase_id
        LEFT JOIN Players pl ON r.player_id = pl.id
        WHERE p.camp_id = ?
    `;
    const params: any[] = [campId];

    if (query) {
        sql += ` AND (g.full_name LIKE ? OR g.email LIKE ? OR pl.first_name LIKE ? OR pl.last_name LIKE ?)`;
        const q = `%${query}%`;
        params.push(q, q, q, q);
    }

    sql += ` ORDER BY p.purchase_timestamp DESC`;
    if (limit) {
        sql += ` LIMIT ?`;
        params.push(limit);
    }
    return await db.prepare(sql).bind(...params).all();
}

export async function getPurchaseById(db: D1Database, purchaseId: number) {
    const sql = `
        SELECT p.*, g.full_name as guardian_name, g.email as guardian_email, pr.name as product_name
        FROM Purchases p
        JOIN Guardians g ON p.guardian_id = g.id
        JOIN Products pr ON p.product_id = pr.id
        WHERE p.id = ?
    `;
    return await db.prepare(sql).bind(purchaseId).first<any>();
}

export async function getPurchaseByToken(db: D1Database, token: string) {
    return await db.prepare(`
        SELECT p.*, g.full_name as guardian_name, g.email as guardian_email, pr.name as product_name
        FROM Purchases p
        JOIN Guardians g ON p.guardian_id = g.id
        JOIN Products pr ON p.product_id = pr.id
        WHERE p.registration_token = ?
    `).bind(token).first<any>();
}


export async function deleteCamp(db: D1Database, id: number) {
    // 1. Check for purchases (safeguard, though API should also check)
    const purchaseCount = await db.prepare("SELECT COUNT(*) as count FROM Purchases WHERE camp_id = ?").bind(id).first<number>('count');
    if (purchaseCount && purchaseCount > 0) {
        throw new Error(`Cannot delete camp with ${purchaseCount} existing purchases.`);
    }

    // 2. Delete CampSettings first (foreign key constraint)
    await db.prepare("DELETE FROM CampSettings WHERE camp_id = ?").bind(id).run();

    // 3. Delete CampProducts (foreign key constraint)
    await db.prepare("DELETE FROM CampProducts WHERE camp_id = ?").bind(id).run();

    // 4. Delete Camp
    return await db.prepare("DELETE FROM Camps WHERE id = ?").bind(id).run();
}

// --- System Settings ---
export async function getSystemSettings(db: D1Database) {
    return await db.prepare("SELECT * FROM SystemSettings").all();
}

export async function updateSystemSetting(db: D1Database, key: string, value: string) {
    return await db.prepare("INSERT OR REPLACE INTO SystemSettings (key, value) VALUES (?, ?)")
        .bind(key, value)
        .run();
}

// --- Form Templates ---
export async function getFormTemplates(db: D1Database) {
    // Fetch Forms instead of FormTemplates since forms are built in the form builder
    return await db.prepare("SELECT id, name, version FROM Forms WHERE is_active = 1 ORDER BY name ASC").all();
}

export async function createFormFromTemplate(db: D1Database, productId: number, formId: number) {
    // Simply link the product to the existing form by updating the product's form_template_id
    // (Note: form_template_id column is actually used to store the form_id)
    return await db.prepare(
        "UPDATE Products SET form_template_id = ? WHERE id = ?"
    ).bind(formId, productId).run();
}

export async function updateFormFromTemplate(db: D1Database, productId: number, formId: number) {
    // Simply update the product's form_template_id to point to the selected form
    // (Note: form_template_id column is actually used to store the form_id)
    return await db.prepare(
        "UPDATE Products SET form_template_id = ? WHERE id = ?"
    ).bind(formId, productId).run();
}
// --- Ingestion Hardening (Spec 003) ---

export async function logIngestion(db: D1Database, data: {
    raw_email_id: string;
    status: 'success' | 'failure';
    message: string;
    details?: any;
}) {
    return await db.prepare(`
        INSERT INTO IngestionLogs (raw_email_id, status, message, details)
        VALUES (?, ?, ?, ?)
    `).bind(
        data.raw_email_id,
        data.status,
        data.message,
        data.details ? JSON.stringify(data.details) : null
    ).run();
}

export async function getIngestionToken(db: D1Database): Promise<string> {
    const result = await db.prepare("SELECT value FROM SystemSettings WHERE key = 'ingestion_token'").first<string>('value');
    return result || 'swedish-camp-ingest-2026'; // Fallback to current placeholder
}

export async function getIngestionLogs(db: D1Database, limit: number = 50) {
    return await db.prepare("SELECT * FROM IngestionLogs ORDER BY created_at DESC LIMIT ?").bind(limit).all();
}
// --- Admin Authentication (Spec 005) ---

export async function createMagicLink(db: D1Database, email: string, token: string, expiresAt: Date) {
    return await db.prepare(`
        INSERT INTO MagicLinks (token, email, expires_at)
        VALUES (?, ?, ?)
    `).bind(token, email, expiresAt.toISOString()).run();
}

export async function getMagicLink(db: D1Database, token: string) {
    return await db.prepare(`
        SELECT * FROM MagicLinks WHERE token = ? AND used = 0
    `).bind(token).first<any>();
}

export async function markMagicLinkUsed(db: D1Database, token: string) {
    return await db.prepare(`
        UPDATE MagicLinks SET used = 1 WHERE token = ?
    `).bind(token).run();
}

export async function createAdminSession(db: D1Database, sessionId: string, email: string, expiresAt: Date) {
    return await db.prepare(`
        INSERT INTO AdminSessions (id, email, expires_at)
        VALUES (?, ?, ?)
    `).bind(sessionId, email, expiresAt.toISOString()).run();
}

export async function getAdminSession(db: D1Database, sessionId: string) {
    return await db.prepare(`
        SELECT * FROM AdminSessions WHERE id = ?
    `).bind(sessionId).first<any>();
}

export async function deleteAdminSession(db: D1Database, sessionId: string) {
    return await db.prepare(`
        DELETE FROM AdminSessions WHERE id = ?
    `).bind(sessionId).run();
}
// --- Reporting & Dashboards (Spec 005) ---

export async function getCampSummary(db: D1Database, campId: number) {
    return await db.prepare(`
        SELECT 
            COUNT(*) as total_purchases,
            SUM(CASE WHEN registration_state = 'completed' THEN 1 ELSE 0 END) as completed_registrations,
            SUM(CASE WHEN registration_state != 'completed' THEN 1 ELSE 0 END) as missing_registrations
        FROM Purchases
        WHERE camp_id = ?
    `).bind(campId).first<{
        total_purchases: number;
        completed_registrations: number;
        missing_registrations: number;
    }>();
}

export async function getAttendanceList(db: D1Database, campId: number) {
    return await db.prepare(`
        SELECT 
            r.id as registration_id,
            r.form_response_json,
            r.registration_timestamp,
            p.first_name || ' ' || p.last_name as player_name,
            p.date_of_birth,
            g.full_name as guardian_name,
            pr.name as product_name,
            pu.registration_state
        FROM Registrations r
        JOIN Players p ON r.player_id = p.id
        JOIN Purchases pu ON r.purchase_id = pu.id
        JOIN Guardians g ON pu.guardian_id = g.id
        JOIN Products pr ON pu.product_id = pr.id
        WHERE pu.camp_id = ?
        ORDER BY p.first_name ASC, p.last_name ASC
    `).bind(campId).all();
}

export async function getKitOrderSummary(db: D1Database, campId: number) {
    const { results } = await db.prepare(`
        SELECT form_response_json
        FROM Registrations r
        JOIN Purchases pu ON r.purchase_id = pu.id
        WHERE pu.camp_id = ? AND pu.registration_state = 'completed'
    `).bind(campId).all();

    const summary: Record<string, Record<string, number>> = {};

    results?.forEach((row: any) => {
        try {
            const responses = JSON.parse(row.form_response_json || '{}');
            Object.entries(responses).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase();
                if ((lowerKey.includes('size') || lowerKey.includes('jersey') || lowerKey.includes('socks')) && value) {
                    const itemType = key.split(/_/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const size = String(value);

                    if (!summary[itemType]) summary[itemType] = {};
                    summary[itemType][size] = (summary[itemType][size] || 0) + 1;
                }
            });
        } catch (e) {
            console.error("Failed to parse registration JSON", e);
        }
    });

    return summary;
}

// --- Spec 006: Camp Day Planner ---

export async function getCampDays(db: D1Database, campId: number) {
    const result = await db.prepare("SELECT * FROM CampDays WHERE camp_id = ? AND status = 'active' ORDER BY date ASC").bind(campId).all<CampDay>();
    return result.results;
}

export async function createCampDay(db: D1Database, data: { camp_id: number; date: string; label?: string }) {
    return await db.prepare("INSERT INTO CampDays (camp_id, date, label) VALUES (?, ?, ?)")
        .bind(data.camp_id, data.date, data.label || null)
        .run();
}

export async function updateCampDay(db: D1Database, id: number, data: Partial<CampDay>) {
    const allowedFields = ['date', 'label', 'status'];
    const sets: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
            sets.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (sets.length === 0) return;
    values.push(id);
    return await db.prepare(`UPDATE CampDays SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteCampDay(db: D1Database, id: number) {
    // Soft delete if sessions exist, otherwise hard delete could be allowed but let's stick to safe defaults
    const sessionCount = await db.prepare("SELECT COUNT(*) as count FROM Sessions WHERE camp_day_id = ?").bind(id).first<number>('count');
    if (sessionCount && sessionCount > 0) {
        // Soft delete
        return await db.prepare("UPDATE CampDays SET status = 'archived' WHERE id = ?").bind(id).run();
    }
    return await db.prepare("DELETE FROM CampDays WHERE id = ?").bind(id).run();
}

export async function getStreams(db: D1Database, campId: number) {
    const result = await db.prepare("SELECT * FROM Streams WHERE camp_id = ? AND status = 'active' ORDER BY name ASC").bind(campId).all<Stream>();
    return result.results;
}

export async function createStream(db: D1Database, data: { camp_id: number; name: string }) {
    return await db.prepare("INSERT INTO Streams (camp_id, name) VALUES (?, ?)")
        .bind(data.camp_id, data.name)
        .run();
}

export async function updateStream(db: D1Database, id: number, data: Partial<Stream>) {
    const allowedFields = ['name', 'status'];
    const sets: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
            sets.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (sets.length === 0) return;
    values.push(id);
    return await db.prepare(`UPDATE Streams SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteStream(db: D1Database, id: number) {
    // Check usage
    const usageCount = await db.prepare("SELECT COUNT(*) as count FROM SessionStreams WHERE stream_id = ?").bind(id).first<number>('count');
    if (usageCount && usageCount > 0) {
        return await db.prepare("UPDATE Streams SET status = 'archived' WHERE id = ?").bind(id).run();
    }
    return await db.prepare("DELETE FROM Streams WHERE id = ?").bind(id).run();
}

export async function getSessionsForDay(db: D1Database, campDayId: number) {
    // Get sessions and their streams
    const { results } = await db.prepare(`
        SELECT s.*, GROUP_CONCAT(ss.stream_id) as stream_ids
        FROM Sessions s
        LEFT JOIN SessionStreams ss ON s.id = ss.session_id
        WHERE s.camp_day_id = ?
        GROUP BY s.id
        ORDER BY s.start_time ASC
    `).bind(campDayId).all<any>();

    return results?.map(r => ({
        ...r,
        stream_ids: r.stream_ids ? r.stream_ids.split(',').map(Number) : []
    })) || [];
}

export async function createSession(db: D1Database, data: Session) {
    return await db.prepare(`
        INSERT INTO Sessions (camp_day_id, name, description, start_time, end_time, location)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(data.camp_day_id, data.name, data.description || null, data.start_time, data.end_time, data.location || null).run();
}

export async function updateSession(db: D1Database, id: number, data: Partial<Session>) {
    const allowedFields = ['name', 'description', 'start_time', 'end_time', 'location'];
    const sets: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
            sets.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (sets.length === 0) return;
    values.push(id);
    return await db.prepare(`UPDATE Sessions SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteSession(db: D1Database, id: number) {
    await db.prepare("DELETE FROM SessionStreams WHERE session_id = ?").bind(id).run();
    return await db.prepare("DELETE FROM Sessions WHERE id = ?").bind(id).run();
}

export async function assignSessionStreams(db: D1Database, sessionId: number, streamIds: number[]) {
    // Clear existing
    await db.prepare("DELETE FROM SessionStreams WHERE session_id = ?").bind(sessionId).run();

    if (streamIds.length === 0) return;

    // Bulk insert (D1 doesn't support generic bulk insert easily, so loop or query builder)
    // For simplicity/safety with prepared statements:
    const stmt = db.prepare("INSERT INTO SessionStreams (session_id, stream_id) VALUES (?, ?)");
    const batch = streamIds.map(sid => stmt.bind(sessionId, sid));
    return await db.batch(batch);
}

export async function updateRegistrationDetails(
    db: D1Database,
    purchaseId: number,
    data: {
        registration_state?: string;
        player?: {
            first_name: string;
            last_name: string;
            date_of_birth: string;
            sex: string;
        };
        form_response_json?: string;
    }
) {
    const stmts: D1PreparedStatement[] = [];

    // 1. Update Purchase State & Data
    const purchaseSets: string[] = [];
    const purchaseValues: any[] = [];
    if (data.registration_state) {
        purchaseSets.push("registration_state = ?");
        purchaseValues.push(data.registration_state);
    }
    if (data.form_response_json) {
        purchaseSets.push("registration_data = ?");
        purchaseValues.push(data.form_response_json);
    }

    if (purchaseSets.length > 0) {
        purchaseValues.push(purchaseId);
        stmts.push(db.prepare(`UPDATE Purchases SET ${purchaseSets.join(", ")} WHERE id = ?`).bind(...purchaseValues));
    }

    // 2. Update Player & Registration if they exist
    if (data.player || data.form_response_json) {
        const reg = await db.prepare("SELECT id, player_id FROM Registrations WHERE purchase_id = ?").bind(purchaseId).first<{ id: number; player_id: number }>();

        if (reg) {
            // Update Registrations (form response)
            if (data.form_response_json) {
                stmts.push(db.prepare("UPDATE Registrations SET form_response_json = ? WHERE id = ?").bind(data.form_response_json, reg.id));
            }

            // Update Player
            if (data.player) {
                stmts.push(db.prepare(`
                    UPDATE Players SET first_name = ?, last_name = ?, date_of_birth = ?, sex = ? WHERE id = ?
                `).bind(data.player.first_name, data.player.last_name, data.player.date_of_birth, data.player.sex, reg.player_id));
            }
        }
    }

    if (stmts.length > 0) {
        return await db.batch(stmts);
    }
}

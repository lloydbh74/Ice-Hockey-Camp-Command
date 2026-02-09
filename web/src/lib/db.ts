import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface Env {
    DB: D1Database;
}

export async function getDb() {
    const { env } = getRequestContext() as unknown as { env: Env };
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
}

// --- Spec 003: Email Ingestion Helpers ---

export async function getAdminEmails(db: D1Database): Promise<string[]> {
    const result = await db.prepare("SELECT value FROM SystemSettings WHERE key = 'admin_emails'").first<string>('value');
    console.log(`[DB] getAdminEmails result: ${JSON.stringify(result)}`);
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

    console.log(`[DB] Created purchase for ${data.guardianEmail} at Camp ID ${data.campId} for £${pricePaid}`);
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
    return await db.prepare("SELECT * FROM Forms WHERE product_id = ? AND is_published = 1 ORDER BY created_at DESC").bind(productId).first();
}

export async function getFormHistory(db: D1Database, productId: number) {
    return await db.prepare("SELECT * FROM Forms WHERE product_id = ? ORDER BY created_at DESC").bind(productId).all();
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
    return await db.prepare("INSERT INTO CampProducts (camp_id, product_id, price) VALUES (?, ?, ?)")
        .bind(data.campId, data.productId, data.price)
        .run();
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

export async function listPurchasesByCamp(db: D1Database, campId: number) {
    return await db.prepare(`
        SELECT p.*, g.full_name as guardian_name, g.email as guardian_email, pr.name as product_name
        FROM Purchases p
        JOIN Guardians g ON p.guardian_id = g.id
        JOIN Products pr ON p.product_id = pr.id
        WHERE p.camp_id = ?
        ORDER BY p.purchase_timestamp DESC
    `).bind(campId).all();
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

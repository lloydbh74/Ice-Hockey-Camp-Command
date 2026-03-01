import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fix = searchParams.get('fix') === 'true';
    const relink = searchParams.get('relink') === 'true';

    try {
        const db = await getDb();
        const results: any = {
            summary: { forms: [], templates: [], products: [] },
            corrupted: [],
            fixed: [],
            relinked: []
        };

        // 1. Diagnostics
        const forms = await db.prepare('SELECT id, name, product_id, is_published, schema_json FROM Forms').all();
        const templates = await db.prepare('SELECT id, name, schema_json FROM FormTemplates').all();
        const products = await db.prepare('SELECT id, name, form_template_id FROM Products').all();

        (forms.results || []).forEach((f: any) => {
            const status = checkSchema(f.schema_json);
            results.summary.forms.push({ id: f.id, name: f.name, product_id: f.product_id, fields: getCount(f.schema_json) });
            if (!status.isValid) results.corrupted.push({ type: 'form', id: f.id, name: f.name, reason: status.reason });
        });

        (templates.results || []).forEach((t: any) => {
            results.summary.templates.push({ id: t.id, name: t.name, fields: getCount(t.schema_json) });
            const status = checkSchema(t.schema_json);
            if (!status.isValid) results.corrupted.push({ type: 'template', id: t.id, name: t.name, reason: status.reason });
        });

        (products.results || []).forEach((p: any) => {
            results.summary.products.push({ id: p.id, name: p.name, form_id: p.form_template_id });
        });

        // 2. Fix Corrupted (Double strings, etc.)
        if (fix) {
            for (const c of results.corrupted) {
                const item = [...(forms.results || []), ...(templates.results || [])].find(x => x.id === c.id);
                if (!item) continue;
                const status = checkSchema(item.schema_json as string);
                if (status.repairedSchema) {
                    const table = c.type === 'form' ? 'Forms' : 'FormTemplates';
                    await db.prepare(`UPDATE ${table} SET schema_json = ? WHERE id = ?`).bind(status.repairedSchema, c.id).run();
                    results.fixed.push({ type: c.type, id: c.id });
                }
            }
        }

        // 3. Mass Relink & Consolidation (Fix for duplicate forms)
        if (relink) {
            const MASTER_DEV_ID = 1;
            const MASTER_ADV_ID = 1772318747599;

            // A. Deactivate all forms EXCEPT the two masters
            await db.prepare(`
                UPDATE Forms 
                SET is_published = 0, is_active = 0 
                WHERE id NOT IN (?, ?)
            `).bind(MASTER_DEV_ID, MASTER_ADV_ID).run();

            // B. Ensure masters are active and published
            await db.prepare('UPDATE Forms SET is_published = 1, is_active = 1 WHERE id IN (?, ?)').bind(MASTER_DEV_ID, MASTER_ADV_ID).run();

            // C. Relink Products to the correct Master Form
            for (const p of (products.results as any[] || [])) {
                let targetId = MASTER_DEV_ID;

                if (p.name.includes('Advanced') || p.name.includes('Pro') || p.name.includes('Elite')) {
                    targetId = MASTER_ADV_ID;
                }

                // Update the product to point to the master form
                // We use form_template_id as the pointer to the active Form ID
                await db.prepare('UPDATE Products SET form_template_id = ? WHERE id = ?').bind(targetId, p.id).run();

                results.relinked.push({ product: p.name, action: 'linked_to_master', masterId: targetId });
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}

function getCount(json: string): number {
    try {
        const p = JSON.parse(json);
        return Array.isArray(p) ? p.length : (typeof p === 'string' ? getCount(p) : 0);
    } catch (e) { return 0; }
}

function checkSchema(jsonStr: string) {
    if (!jsonStr) return { isValid: false, reason: 'empty' };
    try {
        let parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) return { isValid: true };
        if (typeof parsed === 'string') {
            try {
                const secondParse = JSON.parse(parsed);
                if (Array.isArray(secondParse)) return { isValid: false, reason: 'double-stringified', repairedSchema: JSON.stringify(secondParse) };
            } catch (e) { }
        }
        if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
            return { isValid: false, reason: 'empty-object', repairedSchema: '[]' };
        }
        return { isValid: false, reason: typeof parsed };
    } catch (e) {
        return { isValid: false, reason: 'unparseable' };
    }
}

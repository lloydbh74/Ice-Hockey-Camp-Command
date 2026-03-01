import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fix = searchParams.get('fix') === 'true';

    try {
        const db = await getDb();
        const results: any = {
            summary: {
                forms: [],
                templates: [],
                products: []
            },
            corrupted: [],
            fixed: []
        };

        // 1. Scan Forms
        const forms = await db.prepare('SELECT id, name, product_id, is_published, schema_json FROM Forms').all();
        (forms.results || []).forEach((f: any) => {
            const status = checkSchema(f.schema_json);
            let fieldCount = 0;
            try { fieldCount = Array.isArray(JSON.parse(f.schema_json)) ? JSON.parse(f.schema_json).length : 0; } catch (e) { }

            results.summary.forms.push({
                id: f.id,
                name: f.name,
                product_id: f.product_id,
                published: f.is_published === 1,
                fields: fieldCount
            });

            if (!status.isValid) {
                results.corrupted.push({ type: 'form', id: f.id, name: f.name, reason: status.reason });
                if (fix && status.repairedSchema) results.fixed.push({ type: 'form', id: f.id, schema: status.repairedSchema });
            }
        });

        // 2. Scan FormTemplates
        const templates = await db.prepare('SELECT id, name, schema_json FROM FormTemplates').all();
        (templates.results || []).forEach((t: any) => {
            let fieldCount = 0;
            try { fieldCount = Array.isArray(JSON.parse(t.schema_json)) ? JSON.parse(t.schema_json).length : 0; } catch (e) { }
            results.summary.templates.push({ id: t.id, name: t.name, fields: fieldCount });
            const status = checkSchema(t.schema_json);
            if (!status.isValid) {
                results.corrupted.push({ type: 'template', id: t.id, name: t.name, reason: status.reason });
                if (fix && status.repairedSchema) results.fixed.push({ type: 'template', id: t.id, schema: status.repairedSchema });
            }
        });

        // 3. Scan Products
        const products = await db.prepare('SELECT id, name, form_template_id FROM Products').all();
        (products.results || []).forEach((p: any) => {
            results.summary.products.push({ id: p.id, name: p.name, form_id: p.form_template_id });
        });

        if (fix && results.fixed.length > 0) {
            for (const item of results.fixed) {
                const table = item.type === 'form' ? 'Forms' : 'FormTemplates';
                await db.prepare(`UPDATE ${table} SET schema_json = ? WHERE id = ?`).bind(item.schema, item.id).run();
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Integrity check error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
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

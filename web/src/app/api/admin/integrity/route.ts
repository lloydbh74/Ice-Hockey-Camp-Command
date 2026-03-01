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
                templates: []
            },
            scanned: 0,
            corrupted: [],
            fixed: []
        };

        // 1. Scan Forms
        const forms = await db.prepare('SELECT id, name, schema_json FROM Forms').all();
        results.scanned += (forms.results || []).length;
        (forms.results || []).forEach((f: any) => {
            results.summary.forms.push({ id: f.id, name: f.name });
            const status = checkSchema(f.schema_json);
            if (!status.isValid) {
                results.corrupted.push({ type: 'form', id: f.id, name: f.name, reason: status.reason });
                if (fix && status.repairedSchema) {
                    results.fixed.push({ type: 'form', id: f.id });
                }
            }
        });

        // Apply fixes for forms if requested
        if (fix && results.fixed.some((f: any) => f.type === 'form')) {
            for (const f of results.corrupted.filter((c: any) => c.type === 'form')) {
                const status = checkSchema((forms.results as any[]).find(x => x.id === f.id).schema_json);
                if (status.repairedSchema) {
                    await db.prepare('UPDATE Forms SET schema_json = ? WHERE id = ?').bind(status.repairedSchema, f.id).run();
                }
            }
        }

        // 2. Scan History
        const history = await db.prepare('SELECT id, form_id, version, schema_json FROM FormHistory').all();
        (history.results || []).forEach((h: any) => {
            const status = checkSchema(h.schema_json);
            if (!status.isValid) {
                results.corrupted.push({ type: 'history', id: h.id, form_id: h.form_id, version: h.version, reason: status.reason });
                if (fix && status.repairedSchema) {
                    results.fixed.push({ type: 'history', id: h.id });
                }
            }
        });

        if (fix && results.fixed.some((f: any) => f.type === 'history')) {
            for (const h of results.corrupted.filter((c: any) => c.type === 'history')) {
                const status = checkSchema((history.results as any[]).find(x => x.id === h.id).schema_json);
                if (status.repairedSchema) {
                    await db.prepare('UPDATE FormHistory SET schema_json = ? WHERE id = ?').bind(status.repairedSchema, h.id).run();
                }
            }
        }

        // 3. Scan FormTemplates
        const templates = await db.prepare('SELECT id, name, schema_json FROM FormTemplates').all();
        (templates.results || []).forEach((t: any) => {
            results.summary.templates.push({ id: t.id, name: t.name });
            const status = checkSchema(t.schema_json);
            if (!status.isValid) {
                results.corrupted.push({ type: 'template', id: t.id, name: t.name, reason: status.reason });
                if (fix && status.repairedSchema) {
                    results.fixed.push({ type: 'template', id: t.id });
                }
            }
        });

        if (fix && results.fixed.some((f: any) => f.type === 'template')) {
            for (const t of results.corrupted.filter((c: any) => c.type === 'template')) {
                const status = checkSchema((templates.results as any[]).find(x => x.id === t.id).schema_json);
                if (status.repairedSchema) {
                    await db.prepare('UPDATE FormTemplates SET schema_json = ? WHERE id = ?').bind(status.repairedSchema, t.id).run();
                }
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Integrity check error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
                return { isValid: false, reason: 'string-but-not-array' };
            } catch (e) {
                return { isValid: false, reason: 'string-malformed' };
            }
        }
        // If it's an object (like {}), it's invalid but we can repair it as [] if it's empty
        if (typeof parsed === 'object' && parsed !== null) {
            if (Object.keys(parsed).length === 0) {
                return { isValid: false, reason: 'empty-object', repairedSchema: '[]' };
            }
            return { isValid: false, reason: 'object-not-array' };
        }
        return { isValid: false, reason: typeof parsed };
    } catch (e) {
        return { isValid: false, reason: 'unparseable' };
    }
}

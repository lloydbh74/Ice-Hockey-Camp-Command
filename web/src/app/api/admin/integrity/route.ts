import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fix = searchParams.get('fix') === 'true';

    try {
        const db = await getDb();
        const results: any = {
            scanned: 0,
            corrupted: [],
            fixed: []
        };

        // 1. Scan Forms
        const forms = await db.prepare('SELECT id, name, schema_json FROM Forms').all();
        results.scanned += forms.results.length;

        for (const form of (forms.results as any[])) {
            const status = checkSchema(form.schema_json);
            if (!status.isValid) {
                results.corrupted.push({
                    type: 'form',
                    id: form.id,
                    name: form.name,
                    reason: status.reason
                });

                if (fix && status.repairedSchema) {
                    await db.prepare('UPDATE Forms SET schema_json = ? WHERE id = ?')
                        .bind(status.repairedSchema, form.id)
                        .run();
                    results.fixed.push({ type: 'form', id: form.id });
                }
            }
        }

        // 2. Scan History (Optional, but good for completeness)
        const history = await db.prepare('SELECT id, form_id, version, schema_json FROM FormHistory').all();
        // results.scanned += history.results.length; // We can track total if we want

        for (const h of (history.results as any[])) {
            const status = checkSchema(h.schema_json);
            if (!status.isValid) {
                results.corrupted.push({
                    type: 'history',
                    id: h.id,
                    form_id: h.form_id,
                    version: h.version,
                    reason: status.reason
                });

                if (fix && status.repairedSchema) {
                    await db.prepare('UPDATE FormHistory SET schema_json = ? WHERE id = ?')
                        .bind(status.repairedSchema, h.id)
                        .run();
                    results.fixed.push({ type: 'history', id: h.id });
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

        // Case 1: Already an array (Valid)
        if (Array.isArray(parsed)) {
            return { isValid: true };
        }

        // Case 2: It's a string (Double-stringified)
        if (typeof parsed === 'string') {
            try {
                const secondParse = JSON.parse(parsed);
                if (Array.isArray(secondParse)) {
                    return {
                        isValid: false,
                        reason: 'double-stringified',
                        repairedSchema: JSON.stringify(secondParse)
                    };
                }
                return { isValid: false, reason: 'string-but-not-array' };
            } catch (e) {
                return { isValid: false, reason: 'string-malformed' };
            }
        }

        return { isValid: false, reason: typeof parsed };
    } catch (e) {
        return { isValid: false, reason: 'unparseable' };
    }
}

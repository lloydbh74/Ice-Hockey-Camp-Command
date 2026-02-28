import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, props: RouteContext) {
    const params = await props.params;
    const { id } = params;

    const sourceFormId = parseInt(id, 10);
    if (isNaN(sourceFormId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        console.log(`[API] Duplicating form ID: ${sourceFormId}`);
        const db = await getDb();

        // 1. Fetch source form
        const sourceForm = await db.prepare('SELECT * FROM Forms WHERE id = ?').bind(sourceFormId).first();
        if (!sourceForm) {
            return NextResponse.json({ error: 'Source form not found' }, { status: 404 });
        }

        // 2. Generate new ID
        const newFormId = Date.now();
        const newFormName = `${sourceForm.name} (Copy)`;
        const newVersion = '1.0.0';
        const initialChangelog = 'Duplicated from Form ID ' + sourceFormId;

        // 3. Ensure the Product exists (Self-healing for FK constraint)
        const product = await db.prepare('SELECT id FROM Products WHERE id = ?').bind(newFormId).first();
        if (!product) {
            console.log(`[API] Product ID ${newFormId} missing for duplication. Creating placeholder product...`);
            await db.prepare('INSERT INTO Products (id, name, description) VALUES (?, ?, ?)')
                .bind(newFormId, `Product ${newFormId}`, 'Auto-generated for Form Builder (Duplicate)')
                .run();
        }

        // 4. Batch insert new form and history
        await db.batch([
            db.prepare(`
                INSERT INTO Forms (id, product_id, name, version, schema_json, changelog, is_published, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1)
            `).bind(newFormId, newFormId, newFormName, newVersion, sourceForm.schema_json, initialChangelog),

            db.prepare(`
                INSERT INTO FormHistory (form_id, version, schema_json, changelog)
                VALUES (?, ?, ?, ?)
            `).bind(newFormId, newVersion, sourceForm.schema_json, initialChangelog)
        ]);

        console.log(`[API] Form duplicated successfully. New ID: ${newFormId}`);
        return NextResponse.json({ success: true, newId: newFormId });

    } catch (error) {
        console.error("Error duplicating form [FULL STACK]:", error);
        const msg = (error as Error)?.message || 'Unknown error';
        return NextResponse.json({ error: `Internal Server Error: ${msg}` }, { status: 500 });
    }
}

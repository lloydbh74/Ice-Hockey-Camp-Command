import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const fieldSchema = z.object({
    id: z.string(),
    type: z.string(),
    label: z.string().optional(),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    step_group: z.number().optional(),
});

const formSaveSchema = z.object({
    schema: z.array(fieldSchema),
    version: z.string(),
    name: z.string().optional(),
    changelog: z.string().optional()
});

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, props: RouteContext) {
    const params = await props.params;
    const { id } = params;

    try {
        const db = await getDb();

        // 1. Get current form
        const form = await db.prepare('SELECT * FROM Forms WHERE id = ?').bind(id).first();
        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        // 2. Get history
        const { results: history } = await db.prepare('SELECT * FROM FormHistory WHERE form_id = ? ORDER BY id DESC').bind(id).all();

        return NextResponse.json({
            ...form,
            history
        });
    } catch (error) {
        console.error("Error fetching form:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, props: RouteContext) {
    const params = await props.params;
    const { id } = params;

    // Ensure ID is a number for DB operations
    const formId = parseInt(id, 10);
    if (isNaN(formId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const validation = formSaveSchema.safeParse(body);

        if (!validation.success) {
            console.error("[API] Validation failed:", validation.error.format());
            return NextResponse.json({
                error: 'Invalid form data. Schema must be an array of objects.',
                details: validation.error.format()
            }, { status: 400 });
        }

        const { schema, version, changelog, name } = validation.data;
        const db = await getDb();

        // 1. Fetch current version (if exists)
        const currentForm = await db.prepare('SELECT * FROM Forms WHERE id = ?').bind(formId).first();

        if (!currentForm) {
            // 1a. Ensure the Product exists (Self-healing for FK constraint)
            const product = await db.prepare('SELECT id FROM Products WHERE id = ?').bind(formId).first();
            if (!product) {
                await db.prepare('INSERT INTO Products (id, name, description) VALUES (?, ?, ?)')
                    .bind(formId, `Product ${formId}`, 'Auto-generated for Form Builder')
                    .run();
            }

            // Use provided name or fallback
            await db.prepare(`
                INSERT INTO Forms (id, product_id, name, version, schema_json, changelog, is_published, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1)
            `).bind(formId, formId, name || `Form ${version}`, version, JSON.stringify(schema), changelog || 'Initial Create').run();

            // Also log to history
            await db.prepare(`
                INSERT INTO FormHistory (form_id, version, schema_json, changelog)
                VALUES (?, ?, ?, ?)
            `).bind(formId, version, JSON.stringify(schema), changelog || 'Initial Create').run();

            return NextResponse.json({ success: true, version, action: 'created' });
        }

        // 2. Transaction: Archive old -> Update new
        await db.batch([
            // Archive current state to history
            db.prepare(`
                INSERT INTO FormHistory (form_id, version, schema_json, changelog)
                VALUES (?, ?, ?, ?)
            `).bind(formId, currentForm.version, currentForm.schema_json, currentForm.changelog || 'Initial Save'),

            // Update main table
            db.prepare(`
                UPDATE Forms 
                SET version = ?, schema_json = ?, changelog = ?, name = ?, is_published = 1, is_active = 1
                WHERE id = ?
            `).bind(version, JSON.stringify(schema), changelog, name || currentForm.name, formId)
        ]);

        return NextResponse.json({ success: true, version });
    } catch (error) {
        console.error("Error saving form:", error);
        const msg = (error as Error)?.message || 'Unknown error';
        return NextResponse.json({ error: `Internal Server Error: ${msg}` }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, props: RouteContext) {
    const params = await props.params;
    const { id } = params;
    const formId = parseInt(id, 10);

    if (isNaN(formId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const db = await getDb();
        // Soft delete (Archive)
        await db.prepare('UPDATE Forms SET is_active = 0 WHERE id = ?').bind(formId).run();
        return NextResponse.json({ success: true, action: 'archived' });
    } catch (error) {
        console.error("Error archiving form:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, props: RouteContext) {
    const params = await props.params;
    const { id } = params;
    const formId = parseInt(id, 10);

    if (isNaN(formId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const db = await getDb();
        const body: any = await request.json();
        const { is_active } = body;

        if (typeof is_active !== 'undefined') {
            await db.prepare('UPDATE Forms SET is_active = ? WHERE id = ?').bind(is_active ? 1 : 0, formId).run();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating form:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

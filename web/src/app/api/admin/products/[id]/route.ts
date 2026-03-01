import { NextResponse } from 'next/server';
import { getDb, updateFormFromTemplate } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { id } = await context.params;
        const product = await db.prepare("SELECT * FROM Products WHERE id = ?").bind(id).first();

        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('[API] getProduct error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { id } = await context.params;
        const { name, description, base_price, form_template_id, sku } = await req.json() as any;

        // --- Foreign Key Constraint Workaround ---
        if (form_template_id) {
            const formTemplateExists = await db.prepare("SELECT id FROM FormTemplates WHERE id = ?").bind(form_template_id).first();
            if (!formTemplateExists) {
                await db.prepare("INSERT INTO FormTemplates (id, name, schema_json) VALUES (?, ?, ?)")
                    .bind(form_template_id, `Auto-Proxy for Form ${form_template_id}`, "[]").run();
            }
        }

        await db.prepare(
            "UPDATE Products SET name = ?, description = ?, base_price = ?, form_template_id = ?, sku = ? WHERE id = ?"
        ).bind(name, description || null, base_price, form_template_id || null, sku || null, id).run();

        // If a form was selected, link it to the product
        if (form_template_id) {
            await updateFormFromTemplate(db, parseInt(id), form_template_id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] updateProduct error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const db = await getDb();
        if (!db) return NextResponse.json({ error: 'Database binding missing' }, { status: 500 });

        const { id } = await context.params;

        // Check if product is used in CampProducts
        const usage = await db.prepare("SELECT COUNT(*) as count FROM CampProducts WHERE product_id = ?")
            .bind(id)
            .first();

        if (usage && (usage as any).count > 0) {
            return NextResponse.json({
                error: 'Cannot delete product that is associated with camps. Please remove camp associations first.'
            }, { status: 400 });
        }

        await db.prepare("DELETE FROM Products WHERE id = ?").bind(id).run();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] deleteProduct error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

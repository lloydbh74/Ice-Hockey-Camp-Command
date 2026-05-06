import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAttendanceList, listPurchasesByCamp, getKitOrderSummary, getKitPersonalizationList, getDetailedKitOrders } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; type: string }> }
) {
    const { id, type } = await params;
    const campId = parseInt(id);

    if (isNaN(campId)) {
        return NextResponse.json({ error: 'Invalid Camp ID' }, { status: 400 });
    }

    try {
        const db = await getDb();
        let csvContent = '';
        const fileName = `camp-${id}-${type}.csv`;

        if (type === 'attendance') {
            const { results } = await getAttendanceList(db, campId);
            const data = results || [];

            // Header
            csvContent = 'Registration ID,Player Name,DOB,Guardian Name,Product,Status,Submitted At,Form Responses\n';

            // Rows
            data.forEach((row: any) => {
                const responses = JSON.parse(row.form_response_json || '{}');
                const schema = JSON.parse(row.schema_json || '[]');

                // Map UUID/random IDs to human-readable labels
                const mappedResponses: Record<string, any> = {};
                Object.entries(responses).forEach(([key, value]) => {
                    if (!key) return;
                    const fieldDef = schema.find((f: any) => f.id === key);
                    if (fieldDef && fieldDef.label) {
                        mappedResponses[fieldDef.label] = value;
                    } else {
                        mappedResponses[key] = value;
                    }
                });

                const responseStr = JSON.stringify(mappedResponses).replace(/"/g, '""');
                csvContent += `${row.registration_id},"${row.player_name}",${row.date_of_birth},"${row.guardian_name}","${row.product_name}",${row.registration_state},${row.registration_timestamp},"${responseStr}"\n`;
            });
        }
        else if (type === 'registrations') {
            const { results } = await listPurchasesByCamp(db, campId);
            const data = results || [];

            // Header
            csvContent = 'Purchase ID,Guardian Name,Email,Product,Amount,Status,Date\n';

            // Rows
            data.forEach((row: any) => {
                csvContent += `${row.id},"${row.guardian_name}",${row.guardian_email},"${row.product_name}",${row.amount},${row.registration_state},${row.purchase_timestamp}\n`;
            });
        }
        else if (type === 'kit-orders') {
            const data = await getDetailedKitOrders(db, campId);

            // Header
            csvContent = 'QUANTITY,SIZE,CUT,NAME,NUMBER,COURSE,EXTRA (Color),ITEM - PRODUCT NAME,COLLAR,MATERIAL,First Name,Last Name\n';

            // Rows
            data.forEach((row: any) => {
                const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
                
                csvContent += [
                    row.quantity,
                    escape(row.size),
                    escape(row.cut),
                    escape(row.name),
                    escape(row.number),
                    escape(row.course),
                    escape(row.extra),
                    escape(row.item),
                    escape(row.collar),
                    escape(row.material),
                    escape(row.firstName),
                    escape(row.lastName)
                ].join(',') + '\n';
            });
        }
        else {
            return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
        }

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        });

    } catch (error: any) {
        console.error('[API] Export error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

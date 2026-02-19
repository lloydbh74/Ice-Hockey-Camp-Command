import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAttendanceList, listPurchasesByCamp, getKitOrderSummary, getKitPersonalizationList } from '@/lib/db';

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
                const responseStr = row.form_response_json.replace(/"/g, '""');
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
            const summary = await getKitOrderSummary(db, campId);
            const personalizations = await getKitPersonalizationList(db, campId);

            csvContent = '--- AGGREGATED SUMMARY ---\n';
            csvContent += 'Item Type,Size,Quantity\n';

            Object.entries(summary).forEach(([itemType, sizes]) => {
                Object.entries(sizes).forEach(([size, quantity]) => {
                    csvContent += `"${itemType}",${size},${quantity}\n`;
                });
            });

            csvContent += '\n--- PERSONALIZATIONS ---\n';
            csvContent += 'Player Name,Jersey Size,Personalization\n';
            (personalizations as any[]).forEach(p => {
                csvContent += `"${p.playerName}","${p.jerseySize}","${p.personalization}"\n`;
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

import { NextRequest, NextResponse } from 'next/server';
import { getDb, listAllPurchases, listPurchasesByCamp } from '@/lib/db';

export const runtime = 'edge';

function escapeCSV(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId');
    const status = searchParams.get('status');
    const query = searchParams.get('q') || undefined;
    const productId = searchParams.get('productId') ? parseInt(searchParams.get('productId')!) : undefined;
    // We don't limit exports, export all matching records
    
    try {
        const db = await getDb();
        let results: any[] = [];

        if (campId && campId !== 'all') {
            const data = await listPurchasesByCamp(db, parseInt(campId), query, undefined, productId);
            results = data.results || [];
        } else {
            const data = await listAllPurchases(db, query, undefined, productId);
            results = data.results || [];
        }

        if (status === 'missing') {
            results = results.filter(r => r.registration_state !== 'completed');
        } else if (status && status !== 'all' && status !== 'important') {
            results = results.filter(r => r.registration_state === status);
        }

        // To build the CSV, we need a unified header set across all records
        // First pass: extract all keys
        const allKeys = new Set<string>();
        const baseKeys = [
            'Purchase ID',
            'Camp Name',
            'Product Name',
            'Registration State',
            'Guardian Name',
            'Guardian Email',
            'Player First Name',
            'Player Last Name',
            'Purchase Date',
            'Amount Paid',
            'Currency'
        ];
        
        baseKeys.forEach(k => allKeys.add(k));

        const parsedRecords = results.map(row => {
            const formData = row.registration_data ? JSON.parse(row.registration_data) : {};
            const schema = row.schema_json ? JSON.parse(row.schema_json) : [];
            
            const dynamicFields: Record<string, string> = {};
            
            // Collect keys from schema for prettier headers if available
            schema.forEach((field: any) => {
                const label = field.label || field.id;
                allKeys.add(label);
                
                // Fetch value from formData matching label or ID
                const val = formData[label] || formData[field.id];
                if (val !== undefined && val !== null) {
                    dynamicFields[label] = val;
                }
            });

            // Also include any extra keys in formData that weren't in schema
            Object.keys(formData).forEach(key => {
                if (!allKeys.has(key)) {
                    allKeys.add(key);
                }
                dynamicFields[key] = formData[key];
            });
            
            return {
                base: {
                    'Purchase ID': row.id,
                    'Camp Name': row.camp_name || '',
                    'Product Name': row.product_name || '',
                    'Registration State': row.registration_state || '',
                    'Guardian Name': row.guardian_name || '',
                    'Guardian Email': row.guardian_email || '',
                    'Player First Name': row.player_first_name || '',
                    'Player Last Name': row.player_last_name || '',
                    'Purchase Date': row.purchase_timestamp || '',
                    'Amount Paid': row.amount || 0,
                    'Currency': row.currency || ''
                },
                dynamic: dynamicFields
            };
        });

        const headers = Array.from(allKeys);
        
        // Build CSV content
        let csvContent = headers.map(escapeCSV).join(',') + '\n';
        
        parsedRecords.forEach(record => {
            const rowStr = headers.map(header => {
                let val = record.base[header as keyof typeof record.base];
                if (val === undefined) {
                    val = record.dynamic[header];
                }
                return escapeCSV(val);
            }).join(',');
            csvContent += rowStr + '\n';
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="registrations-export.csv"',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });

    } catch (error: any) {
        console.error('[API] Registrations export error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

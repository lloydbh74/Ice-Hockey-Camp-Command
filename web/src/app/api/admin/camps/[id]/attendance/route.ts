import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAttendanceList } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const campId = parseInt(id);

    if (isNaN(campId)) {
        return NextResponse.json({ error: 'Invalid Camp ID' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const { results } = await getAttendanceList(db, campId);

        const attendance = (results || []).map((row: any) => {
            const responses = JSON.parse(row.form_response_json || '{}');
            const schema = JSON.parse(row.schema_json || '[]');

            // Find highlighted field labels and IDs (either boolean toggle OR has rules)
            const highlightedFields = schema.filter((field: any) => field.isHighlighted || (field.highlightRules && field.highlightRules.length > 0));

            const criticalInfo: Record<string, string> = {};

            // Find matches in user's submission
            highlightedFields.forEach((field: any) => {
                // Find answer whose key matches label exactly, or whose ID matches
                const val = responses[field.label] || responses[field.id];
                let finalValStr = '';

                if (val) {
                    finalValStr = String(val).trim();
                } else {
                    // Try loose matching fallback
                    const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
                    const normalizedLabel = normalizeKey(field.label);

                    let fallbackKey = Object.keys(responses).find(k => normalizeKey(k) === normalizedLabel);

                    if (!fallbackKey) {
                        // Semantic Legacy Bridge
                        const legacyMapping: Record<string, string> = {
                            'suffer from asthma': 'med_asthma',
                            'suffer from allergies bites stings food': 'med_allergies',
                            'suffer from diabetes': 'med_diabetes',
                            'require an epipen': 'med_allergies',
                            'suffered a concussion': 'med_concussion',
                            'undergone any surgery in the past 2 years': 'med_surgery',
                            'suffered any broken bones in the last 2 years': 'med_broken_bones',
                            'currently have a medical condition illness or injury': 'medical_details'
                        };

                        const mappedLegacyKey = legacyMapping[normalizedLabel];
                        if (mappedLegacyKey && responses[mappedLegacyKey]) {
                            fallbackKey = mappedLegacyKey;
                        } else {
                            const excludeWords = ['suffer', 'from', 'have', 'currently', 'take', 'require', 'any', 'the', 'last', 'years', 'please', 'details'];
                            const significantWords = normalizedLabel
                                .split(' ')
                                .filter(w => w.length > 3 && !excludeWords.includes(w));

                            if (significantWords.length > 0) {
                                fallbackKey = Object.keys(responses).find(k => {
                                    const normK = normalizeKey(k);
                                    return significantWords.some(w => normK.includes(w)) && (k.startsWith('med_') || k.startsWith('emergency'));
                                });
                            }
                        }
                    }

                    if (fallbackKey && responses[fallbackKey]) {
                        finalValStr = String(responses[fallbackKey]).trim();
                    }
                }

                if (finalValStr && finalValStr.toLowerCase() !== 'false') {
                    // Check if it matches a highlight rule first
                    let matchedRule = false;
                    if (field.highlightRules && Array.isArray(field.highlightRules)) {
                        const rule = field.highlightRules.find((r: any) =>
                            r.value && finalValStr.toLowerCase() === r.value.toLowerCase()
                        );
                        if (rule && rule.message) {
                            criticalInfo[field.label] = rule.message;
                            matchedRule = true;
                        }
                    }

                    // If no rule matched, but field is broadly highlighted, show raw value
                    if (!matchedRule && field.isHighlighted) {
                        criticalInfo[field.label] = finalValStr;
                    }
                }
            });

            // Map UUID/random IDs to human-readable labels for display
            const displayResponses: Record<string, any> = {};
            Object.entries(responses).forEach(([key, value]) => {
                if (!key) return;
                const fieldDef = schema.find((f: any) => f.id === key);
                if (fieldDef && fieldDef.label) {
                    displayResponses[fieldDef.label] = value;
                } else {
                    displayResponses[key] = value;
                }
            });

            return {
                id: row.registration_id,
                playerName: row.player_name,
                dob: row.date_of_birth,
                guardianName: row.guardian_name,
                productName: row.product_name,
                status: row.registration_state,
                timestamp: row.registration_timestamp,
                criticalInfo,
                fullResponse: displayResponses
            };
        });

        return NextResponse.json({ results: attendance });

    } catch (error: any) {
        console.error('[API] Attendance List error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

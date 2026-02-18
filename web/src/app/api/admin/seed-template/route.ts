import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

/**
 * TEMPORARY ENDPOINT to seed a comprehensive form template based on the Google Forms screenshot.
 * This avoids using wrangler migrations which are currently failing locally.
 * 
 * Usage: POST /api/admin/seed-template with x-admin-token header
 */
export async function POST(req: Request) {
    try {
        const adminToken = req.headers.get('x-admin-token');
        if (!adminToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();

        // Verify admin token
        const settings = await db.prepare("SELECT value FROM SystemSettings WHERE key = 'admin_token'").first<{ value: string }>();
        if (!settings || settings.value !== adminToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templateName = 'Swedish Hockey Camp 2025 Comprehensive';
        const templateDescription = 'Detailed registration form matching the official 2025 Google Form.';

        const schema = [
            // SECTION 1: Participant Information
            { id: 's1_h', type: 'heading', label: 'Hockey Sweden Camp 3 Day Camp Registration Form', required: false, headingLevel: 'h1' },
            { id: 's1_desc', type: 'text', label: 'Description', required: false, defaultValue: 'Please fill out prior to completing the checkout process.' },

            { id: 'email', type: 'text', label: 'Email', required: true },
            { id: 'surname', type: 'text', label: 'Participants surname', required: true },
            { id: 'forename', type: 'text', label: 'Participants forename', required: true },
            { id: 'dob', type: 'text', label: 'Participants Date Of Birth', required: true },
            { id: 'sex', type: 'radio', label: 'Sex', required: true, options: ['Male', 'Female', 'Prefer not to say'] },
            { id: 'club', type: 'text', label: 'Participants Current Club', required: true },
            { id: 'age_group', type: 'radio', label: 'Participants playing age group', required: true, options: ['U10', 'U12', 'U14', 'U16'] },
            { id: 'experience', type: 'radio', label: 'Playing Experience', required: true, options: ['6+ Months', '2+ Years', '3+ Years', 'Option 4'] },
            { id: 'position', type: 'radio', label: 'Participants Playing position', required: true, options: ['Netminder', 'Defence', 'Left Wing', 'Right Wing', 'Forward'] },
            { id: 'level', type: 'radio', label: 'Participants Playing Level', required: true, options: ['Club', 'NHL', 'Conference/Showcase', 'England'] },

            { id: 'div1', type: 'divider', label: '', required: false },

            // SECTION 2: Camp Information
            { id: 's2_h', type: 'heading', label: 'Camp Information', required: false, headingLevel: 'h2' },
            { id: 'camp_applied', type: 'radio', label: 'Camp applied for', required: true, options: ['Short Sticks (2013 - 2018)', 'Hat-Trick Heroes (2010-2016)'] },

            {
                id: 'jersey_size', type: 'image_choice', label: 'Please select jersey size required', required: true, imageOptions: [
                    { label: '40', imageUrl: 'https://placehold.co/400x300?text=Jersey+40' },
                    { label: '50', imageUrl: 'https://placehold.co/400x300?text=Jersey+50' },
                    { label: '60', imageUrl: 'https://placehold.co/400x300?text=Jersey+60' },
                    { label: '70', imageUrl: 'https://placehold.co/400x300?text=Jersey+70' },
                    { label: '80', imageUrl: 'https://placehold.co/400x300?text=Jersey+80' },
                    { label: '90', imageUrl: 'https://placehold.co/400x300?text=Jersey+90' },
                    { label: '100', imageUrl: 'https://placehold.co/400x300?text=Jersey+100' },
                    { label: '110', imageUrl: 'https://placehold.co/400x300?text=Jersey+110' },
                    { label: '120', imageUrl: 'https://placehold.co/400x300?text=Jersey+120' },
                    { label: '130', imageUrl: 'https://placehold.co/400x300?text=Jersey+130' },
                    { label: '140', imageUrl: 'https://placehold.co/400x300?text=Jersey+140' },
                    { label: 'S', imageUrl: 'https://placehold.co/400x300?text=Jersey+S' },
                    { label: 'M', imageUrl: 'https://placehold.co/400x300?text=Jersey+M' },
                    { label: 'L', imageUrl: 'https://placehold.co/400x300?text=Jersey+L' },
                    { label: 'XL', imageUrl: 'https://placehold.co/400x300?text=Jersey+XL' },
                    { label: 'XXL', imageUrl: 'https://placehold.co/400x300?text=Jersey+XXL' },
                    { label: '3XL', imageUrl: 'https://placehold.co/400x300?text=Jersey+3XL' },
                    { label: '4XL', imageUrl: 'https://placehold.co/400x300?text=Jersey+4XL' }
                ]
            },

            { id: 'shirt_type', type: 'radio', label: 'Choose type of shirt required', required: true, options: ['Player', 'Net Minder'] },
            { id: 'personalization', type: 'text', label: 'Personalization (if upgraded)', required: false },

            {
                id: 'tshirt_size', type: 'image_choice', label: 'Please select t-shirt size required', required: true, imageOptions: [
                    { label: '60', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+60' },
                    { label: '70', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+70' },
                    { label: '80', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+80' },
                    { label: '90', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+90' },
                    { label: '100', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+100' },
                    { label: 'Jr S', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+Jr+S' },
                    { label: 'Jr M', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+Jr+M' },
                    { label: 'Jr L', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+Jr+L' },
                    { label: 'Jr XL', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+Jr+XL' },
                    { label: 'S', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+S' },
                    { label: 'M', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+M' },
                    { label: 'L', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+L' },
                    { label: 'XL', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+XL' },
                    { label: 'XXL', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+XXL' },
                    { label: '3XL', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+3XL' },
                    { label: '4XL', imageUrl: 'https://placehold.co/400x300?text=T-Shirt+4XL' }
                ]
            },

            { id: 'div2', type: 'divider', label: '', required: false },

            // SECTION 3: Medical Information
            { id: 's3_h', type: 'heading', label: 'Participants medical information', required: false, headingLevel: 'h2' },
            { id: 'med_broken_bones', type: 'radio', label: 'Suffered any broken bones in the last 12 months?', required: true, options: ['Yes', 'No'] },
            { id: 'med_joint_injuries', type: 'radio', label: 'Suffered any joint/tendon injuries?', required: true, options: ['Yes', 'No'] },
            { id: 'med_surgery_past', type: 'radio', label: 'Undergone any surgery in the past?', required: true, options: ['Yes', 'No'] },
            { id: 'med_heart_murmur', type: 'radio', label: 'Had heart murmurs or irregular heartbeat?', required: true, options: ['Yes', 'No'] },
            { id: 'med_failing_loss', type: 'radio', label: 'Had a history of fainting / loss of consciousness?', required: true, options: ['Yes', 'No'] },
            { id: 'med_blood_pressure', type: 'radio', label: 'Suffered from high or low blood pressure?', required: true, options: ['Yes', 'No'] },
            { id: 'med_ecg', type: 'radio', label: 'Previously had an ECG?', required: true, options: ['Yes', 'No'] },
            { id: 'med_concussion', type: 'radio', label: 'Suffered a concussion?', required: true, options: ['Yes', 'No'] },
            { id: 'med_details', type: 'text', label: 'If "Yes" to any above, please give details (including dates):', required: false },

            { id: 'med_condition', type: 'radio', label: 'Currently have a medical condition?', required: true, options: ['Yes', 'No'] },
            { id: 'med_medication', type: 'radio', label: 'Currently take a regular medication?', required: true, options: ['Yes', 'No'] },
            { id: 'med_asthma', type: 'radio', label: 'Suffer from asthma?', required: true, options: ['Yes', 'No'] },
            { id: 'med_diabetes', type: 'radio', label: 'Suffer from diabetes?', required: true, options: ['Yes', 'No'] },
            { id: 'med_allergies', type: 'radio', label: 'Suffer from allergies (bites/stings etc)?', required: true, options: ['Yes', 'No'] },
            { id: 'med_epilepsy', type: 'radio', label: 'Suffer from epilepsy?', required: true, options: ['Yes', 'No'] },
            { id: 'med_epipen', type: 'radio', label: 'Require an epipen?', required: true, options: ['Yes', 'No'] },
            { id: 'med_condition_details', type: 'text', label: 'If "Yes" to any above, please give details:', required: false },
            { id: 'med_instr', type: 'text', label: 'Any medication instructions for staff?', required: false },

            { id: 'div3', type: 'divider', label: '', required: false },

            // SECTION 4: Emergency Contacts
            { id: 's4_h', type: 'heading', label: 'Emergency contact details', required: false, headingLevel: 'h2' },
            { id: 'doc_name', type: 'text', label: 'Doctor / Surgery name', required: true },
            { id: 'doc_address', type: 'text', label: 'Doctor / Surgery address', required: true },
            { id: 'doc_phone', type: 'text', label: 'Doctor / Surgery Contact Number', required: true },

            { id: 'ec1_name', type: 'text', label: 'Emergency Contact 1 - Name', required: true },
            { id: 'ec1_phone', type: 'text', label: 'Emergency Contact 1 - Contact Number', required: true },
            { id: 'ec1_rel', type: 'text', label: 'Relationship to participant', required: true },

            { id: 'ec2_name', type: 'text', label: 'Emergency Contact 2 - Name', required: true },
            { id: 'ec2_phone', type: 'text', label: 'Emergency Contact 2 - Contact Number', required: true },
            { id: 'ec2_rel', type: 'text', label: 'Relationship to participant', required: true },

            { id: 'div4', type: 'divider', label: '', required: false },

            // SECTION 5: Agreements
            { id: 's5_h', type: 'heading', label: 'Agreements and Declarations', required: false, headingLevel: 'h2' },
            { id: 'consent_contact', type: 'checkbox', label: 'I agree that a parent / guardian is contactable at all times.', required: true },
            { id: 'consent_medical', type: 'radio', label: 'Consent for medical treatment in emergency', required: true, options: ['I agree', 'I disagree'] },
            { id: 'consent_terms', type: 'checkbox', label: 'I confirm I have read the terms and conditions.', required: true },
            { id: 'consent_media', type: 'radio', label: 'Consent for my child to be included in photos/video', required: true, options: ['Yes', 'No'] },
            { id: 'consent_rules', type: 'checkbox', label: 'I agree that participant and parent will abide by rink rules.', required: true },
            { id: 'digital_signature', type: 'text', label: 'Digital signature of person completing form', required: true },
            { id: 'signature_rel', type: 'text', label: 'Relationship to participant', required: true },
            { id: 'completion_date', type: 'text', label: 'Completion Date', required: true }
        ];

        // Insert into database
        const result = await db.prepare(`
            INSERT INTO FormTemplates (name, description, schema_json)
            VALUES (?, ?, ?)
        `).bind(templateName, templateDescription, JSON.stringify(schema)).run();

        return NextResponse.json({
            success: true,
            message: 'Form template seeded successfully',
            templateId: result.meta.last_row_id
        });
    } catch (err: any) {
        console.error('Error seeding template:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

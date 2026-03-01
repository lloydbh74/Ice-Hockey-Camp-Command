import React, { use } from 'react';
import { getDb } from '@/lib/db';
import PublicFormRenderer from '@/components/form/PublicFormRenderer';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

interface RegisterPageProps {
    params: Promise<{ id: string }>;
}

export default async function RegisterPage(props: RegisterPageProps) {
    const params = await props.params;
    const { id } = params;
    const formId = parseInt(id, 10);

    if (isNaN(formId)) return notFound();

    const db = await getDb();
    const form: any = await db.prepare('SELECT * FROM Forms WHERE id = ? AND is_active = 1').bind(formId).first();

    if (!form) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{form.name}</h1>
                    <p className="text-slate-500">Please fill out the form below to complete your registration.</p>
                </div>
                {(() => {
                    let schema = [];
                    try {
                        const parsed = JSON.parse(form.schema_json);
                        schema = Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        console.error("[REGISTER] Corrupt schema for form:", form.id, e);
                    }
                    return (
                        <PublicFormRenderer
                            formId={formId}
                            schema={schema}
                        />
                    );
                })()}
            </div>
        </div>
    );
}

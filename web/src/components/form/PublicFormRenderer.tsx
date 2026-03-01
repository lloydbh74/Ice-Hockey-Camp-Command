'use client';

import React, { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import WizardNavigation from './WizardNavigation';

interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'image_choice' | 'date' | 'image' | 'heading' | 'paragraph' | 'bullet' | 'divider' | 'separator';
    label: string;
    required: boolean;
    options?: string[];
    imageOptions?: { label: string; imageUrl: string }[];
    headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
    description?: string;
    imageUrl?: string;
    imageAlt?: string;
    step_group?: number;
}

interface PublicFormRendererProps {
    formId: number;
    schema: FormField[];
    purchaseId?: number;
    registrationToken?: string;
}

export default function PublicFormRenderer({ formId, schema, purchaseId, registrationToken }: PublicFormRendererProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const methods = useForm({
        mode: 'onBlur'
    });

    // 1. Group fields into steps based on 'divider' or explicit 'step_group'
    const steps = useMemo(() => {
        if (!Array.isArray(schema)) {
            console.error("[PublicFormRenderer] Schema is not an array:", schema);
            return [];
        }

        // Check if any field has an explicit step_group (legacy/advanced support)
        const hasExplicitGroups = schema.some(f => f.step_group !== undefined && f.step_group !== 0);

        if (hasExplicitGroups) {
            const stepsMap = new Map<number, FormField[]>();
            schema.forEach(field => {
                const group = field.step_group || 0;
                if (!stepsMap.has(group)) {
                    stepsMap.set(group, []);
                }
                stepsMap.get(group)?.push(field);
            });

            return Array.from(stepsMap.entries())
                .sort(([groupA], [groupB]) => groupA - groupB)
                .map(([, fields]) => fields)
                .filter(step => step.length > 0);
        }

        // Split by 'divider' type fields - each divider starts a NEW step
        const result: FormField[][] = [];
        let currentStepFields: FormField[] = [];

        schema.forEach(field => {
            if (field.type === 'divider') {
                if (currentStepFields.length > 0) {
                    result.push(currentStepFields);
                }
                currentStepFields = [field]; // Divider becomes the header of the next step
            } else {
                currentStepFields.push(field);
            }
        });

        if (currentStepFields.length > 0) {
            result.push(currentStepFields);
        }

        return result.length > 0 ? result : [[]];
    }, [schema]);

    const activeFields = steps[currentStep] || [];

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Use the new registration submit endpoint
            const res = await fetch(`/api/registration/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchaseId,
                    formId,
                    formData: data,
                    registrationToken
                }),
            });

            if (res.ok) {
                setIsSubmitted(true);
            } else {
                const err = await res.json() as any;
                alert(`Submission failed: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Submission failed", error);
            alert("Submission failed. Check your internet connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Complete!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Thank you for registering. You will receive a confirmation email shortly.</p>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Progress Bar */}
                <div
                    className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full relative"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(((currentStep + 1) / steps.length) * 100)}
                    aria-valuetext={`Step ${currentStep + 1} of ${steps.length}`}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-primary/20 transition-all duration-500 ease-in-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {activeFields.map((field) => (
                            <div key={field.id} className="space-y-2">
                                {/* Only show label and description for actual input fields */}
                                {!['heading', 'paragraph', 'bullet', 'separator', 'divider', 'image'].includes(field.type) && (
                                    <>
                                        <label htmlFor={field.id} className="block text-[15px] font-semibold text-slate-900 dark:text-white">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
                                        </label>

                                        {field.description && (
                                            <div id={`desc-${field.id}`} className="text-sm text-slate-700 dark:text-slate-300 mb-3 prose prose-sm dark:prose-invert prose-a:text-primary hover:prose-a:text-primary-dark">
                                                <ReactMarkdown>{field.description}</ReactMarkdown>
                                            </div>
                                        )}
                                    </>
                                )}

                                {field.type === 'heading' && (
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-2">{field.label}</h3>
                                )}

                                {field.type === 'paragraph' && (
                                    <div className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap prose prose-slate dark:prose-invert max-w-none prose-a:text-primary hover:prose-a:text-primary-dark">
                                        <ReactMarkdown>{field.label}</ReactMarkdown>
                                    </div>
                                )}

                                {field.type === 'text' && (
                                    <input
                                        id={`field-${field.id}`}
                                        type="text"
                                        {...methods.register(field.id, { required: field.required })}
                                        aria-required={field.required}
                                        aria-invalid={!!methods.formState.errors[field.id]}
                                        className="w-full p-3 bg-white border border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                )}

                                {field.type === 'textarea' && (
                                    <textarea
                                        id={`field-${field.id}`}
                                        rows={4}
                                        {...methods.register(field.id, { required: field.required })}
                                        aria-required={field.required}
                                        aria-invalid={!!methods.formState.errors[field.id]}
                                        className="w-full p-3 bg-white border border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] resize-y"
                                    />
                                )}

                                {field.type === 'date' && (
                                    <input
                                        id={`field-${field.id}`}
                                        type="date"
                                        {...methods.register(field.id, { required: field.required })}
                                        aria-required={field.required}
                                        aria-invalid={!!methods.formState.errors[field.id]}
                                        className="w-full p-3 bg-white border border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                )}

                                {field.type === 'checkbox' && (
                                    <div className="space-y-2">
                                        {field.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                                <input
                                                    type="checkbox"
                                                    value={opt}
                                                    {...methods.register(field.id, { required: field.required })}
                                                    className="w-4 h-4 rounded border-slate-400 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-slate-800 dark:text-slate-200">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {field.type === 'select' && (
                                    <select
                                        id={`field-${field.id}`}
                                        {...methods.register(field.id, { required: field.required })}
                                        aria-required={field.required}
                                        aria-invalid={!!methods.formState.errors[field.id]}
                                        className="w-full p-3 bg-white border border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    >
                                        <option value="">Select an option...</option>
                                        {field.options?.map((opt, idx) => (
                                            <option key={idx} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'radio' && (
                                    <div className="space-y-2">
                                        {field.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                                <input
                                                    type="radio"
                                                    value={opt}
                                                    {...methods.register(field.id, { required: field.required })}
                                                    className="w-4 h-4 border-slate-400 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-slate-800 dark:text-slate-200">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {field.type === 'image_choice' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {field.imageOptions?.map((opt, idx) => (
                                            <label
                                                key={idx}
                                                className={`flex flex-col gap-2 p-2 border rounded-xl cursor-pointer transition-all hover:shadow-md
                                                    ${methods.watch(field.id) === opt.label ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    value={opt.label}
                                                    {...methods.register(field.id, { required: field.required })}
                                                    className="hidden"
                                                />
                                                <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                                    {(opt.imageUrl || (opt as any).src) ? (
                                                        <img src={opt.imageUrl || (opt as any).src} alt={opt.label} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-slate-300">image</span>
                                                    )}
                                                </div>
                                                <div className="text-xs font-bold text-center text-slate-800 dark:text-slate-200 py-1">
                                                    {opt.label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {field.type === 'bullet' && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-slate-600 dark:text-slate-400 mt-1.5">•</span>
                                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{field.label}</p>
                                    </div>
                                )}

                                {field.type === 'divider' && (
                                    <div className="py-6 flex items-center gap-4">
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                            {field.label && field.label !== 'New Question' ? field.label : 'Section Break'}
                                        </span>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                    </div>
                                )}

                                {field.type === 'separator' && (
                                    <hr className="border-slate-400 dark:border-white opacity-100 my-6" />
                                )}

                                {field.type === 'image' && (field.imageUrl || (field as any).src) && (
                                    <div className="my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                        <img src={field.imageUrl || (field as any).src} alt={field.imageAlt || ''} className="w-full h-auto max-h-[600px] object-contain mx-auto" />
                                    </div>
                                )}

                                {methods.formState.errors[field.id] && (
                                    <p id={`error-${field.id}`} className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1" role="alert">
                                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">error</span>
                                        This field is required
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <WizardNavigation
                        currentStep={currentStep}
                        totalSteps={steps.length}
                        onNext={async () => {
                            // Validate current step fields before proceeding
                            const stepFields = activeFields.map(f => f.id);
                            const isValid = await methods.trigger(stepFields);
                            if (isValid) setCurrentStep(prev => prev + 1);
                        }}
                        onBack={() => setCurrentStep(prev => prev - 1)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </form>
        </FormProvider>
    );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import WizardNavigation from './WizardNavigation';

interface FormField {
    id: string;
    type: string;
    label: string;
    description?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
}

interface PublicFormRendererProps {
    formId: number;
    schema: FormField[];
}

export default function PublicFormRenderer({ formId, schema }: PublicFormRendererProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const methods = useForm({
        mode: 'onBlur'
    });

    // 1. Group fields into steps based on 'section_divider'
    const steps = useMemo(() => {
        const grouped: FormField[][] = [[]];
        let stepIndex = 0;

        schema.forEach(field => {
            if (field.type === 'section_divider') {
                stepIndex++;
                grouped[stepIndex] = [];
            } else {
                grouped[stepIndex].push(field);
            }
        });

        // Remove empty steps
        return grouped.filter(step => step.length > 0);
    }, [schema]);

    const activeFields = steps[currentStep] || [];

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/forms/${formId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setIsSubmitted(true);
            } else {
                alert("Something went wrong with your submission. Please try again.");
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
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                    Submit another response
                </button>
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
                                <label htmlFor={field.id} className="block text-[15px] font-semibold text-slate-900 dark:text-white">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
                                </label>

                                {field.description && (
                                    <p id={`desc-${field.id}`} className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        {field.description}
                                    </p>
                                )}

                                {field.type === 'heading' && (
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-2">{field.label}</h3>
                                )}

                                {field.type === 'paragraph' && (
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{field.label}</p>
                                )}

                                {field.type === 'text_input' && (
                                    <input
                                        id={`field-${field.id}`}
                                        type="text"
                                        placeholder={field.placeholder}
                                        {...methods.register(field.id, { required: field.required })}
                                        aria-required={field.required}
                                        aria-invalid={!!methods.formState.errors[field.id]}
                                        aria-describedby={methods.formState.errors[field.id] ? `error-${field.id}` : field.description ? `desc-${field.id}` : undefined}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0F2FE] focus:border-[#E0F2FE] transition-all"
                                    />
                                )}

                                {field.type === 'checkbox' && (
                                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                                        <input
                                            id={`field-${field.id}`}
                                            type="checkbox"
                                            {...methods.register(field.id)}
                                            aria-invalid={!!methods.formState.errors[field.id]}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-700">{field.label}</span>
                                    </label>
                                )}

                                {field.type === 'dropdown' && (
                                    <select
                                        id={`field-${field.id}`}
                                        {...methods.register(field.id, { required: field.required })}
                                        aria-required={field.required}
                                        aria-invalid={!!methods.formState.errors[field.id]}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0F2FE] focus:border-[#E0F2FE] transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                    >
                                        <option value="">Select an option...</option>
                                        {field.options?.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'radio_group' && (
                                    <div className="space-y-2" role="radiogroup" aria-labelledby={`field-${field.id}`} aria-required={field.required}>
                                        {field.options?.map(opt => (
                                            <label key={opt.value} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                                                <input
                                                    type="radio"
                                                    value={opt.value}
                                                    {...methods.register(field.id, { required: field.required })}
                                                    className="w-4 h-4 border-slate-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-slate-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {field.type === 'separator' && (
                                    <div className="h-px bg-slate-100 my-4" />
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

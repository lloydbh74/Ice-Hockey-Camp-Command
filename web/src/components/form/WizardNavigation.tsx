import React from 'react';

interface WizardNavigationProps {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export default function WizardNavigation({
    currentStep,
    totalSteps,
    onNext,
    onBack,
    isSubmitting
}: WizardNavigationProps) {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div>
                {!isFirstStep && (
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Step {currentStep + 1} of {totalSteps}
                </span>

                <button
                    type={isLastStep ? 'submit' : 'button'}
                    onClick={isLastStep ? undefined : onNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-slate-900 dark:bg-primary rounded-lg hover:bg-slate-800 dark:hover:bg-primary-dark shadow-md transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                            Submitting...
                        </>
                    ) : isLastStep ? (
                        <>
                            Complete Registration
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </>
                    ) : (
                        <>
                            Next Step
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

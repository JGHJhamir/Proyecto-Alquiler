import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep === stepNumber;
                    const isCompleted = currentStep > stepNumber;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={stepNumber} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${isCompleted
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                            : isActive
                                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-110'
                                                : 'bg-slate-200 text-slate-400'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <span
                                    className={`mt-2 text-sm font-bold transition-colors ${isActive || isCompleted
                                            ? 'text-slate-900'
                                            : 'text-slate-400'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                                <div className="flex-1 h-1 mx-4 relative">
                                    <div className="absolute inset-0 bg-slate-200 rounded-full"></div>
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-brand-blue rounded-full transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'
                                            }`}
                                    ></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;

import React from "react";

export type WorkflowStep = "input" | "curation" | "delivery";

export interface StepSwitcherBarProps {
  currentStep: WorkflowStep;
  onSelectStep: (step: WorkflowStep) => void;
  canNavigateCuration?: boolean;
  canNavigateDelivery?: boolean;
}

export const StepSwitcherBar: React.FC<StepSwitcherBarProps> = ({
  currentStep,
  onSelectStep,
  canNavigateCuration = true,
  canNavigateDelivery = true,
}) => {
  const steps: { id: WorkflowStep; number: string; label: string; enabled: boolean }[] = [
    { id: "input", number: "01", label: "Input", enabled: true },
    { id: "curation", number: "02", label: "Curation", enabled: canNavigateCuration },
    { id: "delivery", number: "03", label: "Delivery", enabled: canNavigateDelivery },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 print:hidden">
      <div className="flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/95 p-1.5 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.4)] backdrop-blur-md">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => step.enabled && onSelectStep(step.id)}
              disabled={!step.enabled}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step.number}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

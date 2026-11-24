import React from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";

export interface WorkflowFlowStepperProps {
  currentStep: "input" | "curation" | "delivery" | "login";
  isRunningJob?: boolean;
  onNavigateStep?: (step: "input" | "curation" | "delivery") => void;
  className?: string;
}

interface StepItem {
  number: number;
  label: string;
  key: "input" | "extraction" | "curation" | "delivery";
  targetStep: "input" | "curation" | "delivery";
}

const STEPS: StepItem[] = [
  { number: 1, label: "Connect Profiles", key: "input", targetStep: "input" },
  { number: 2, label: "AI Extraction", key: "extraction", targetStep: "input" },
  { number: 3, label: "Curate & Edit", key: "curation", targetStep: "curation" },
  { number: 4, label: "Export PDF", key: "delivery", targetStep: "delivery" },
];

export const WorkflowFlowStepper: React.FC<WorkflowFlowStepperProps> = ({
  currentStep,
  isRunningJob = false,
  onNavigateStep,
  className = "",
}) => {
  // Determine active step index:
  // 0: input (form ready)
  // 1: extraction (job running)
  // 2: curation
  // 3: delivery
  let activeIndex = 0;
  if (currentStep === "input") {
    activeIndex = isRunningJob ? 1 : 0;
  } else if (currentStep === "curation") {
    activeIndex = 2;
  } else if (currentStep === "delivery") {
    activeIndex = 3;
  }

  return (
    <nav
      aria-label="Workflow progress"
      className={`w-full max-w-[840px] mx-auto mb-6 px-1 ${className}`}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isClickable = isCompleted && onNavigateStep;

          return (
            <React.Fragment key={step.number}>
              <div
                onClick={() => isClickable && onNavigateStep(step.targetStep)}
                className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-500/30"
                    : isCompleted
                    ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer font-medium"
                    : "text-slate-400 dark:text-slate-500 font-normal opacity-70"
                }`}
                title={isClickable ? `Kembali ke langkah ${step.label}` : undefined}
              >
                {/* Step badge / number / check / loader */}
                <div
                  className={`size-5 sm:size-5.5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-3 stroke-[2.5]" />
                  ) : isActive && isRunningJob && step.key === "extraction" ? (
                    <Loader2 className="size-3 animate-spin stroke-[2.5]" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-[11.5px] sm:text-xs truncate tracking-tight transition-colors ${
                    isActive
                      ? "inline font-bold text-blue-900 dark:text-blue-100"
                      : isCompleted
                      ? "hidden sm:inline text-slate-700 dark:text-slate-300 font-medium"
                      : "hidden sm:inline text-slate-400 dark:text-slate-500 font-normal"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <ChevronRight className="size-3.5 text-slate-300 dark:text-slate-600 shrink-0 select-none" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

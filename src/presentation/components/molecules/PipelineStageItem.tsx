import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

export type StageStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineStageItemProps {
  stepNumber: number;
  title: string;
  description: string;
  status: StageStatus;
  isLast?: boolean;
}

export const PipelineStageItem: React.FC<PipelineStageItemProps> = ({
  stepNumber,
  title,
  description,
  status,
  isLast = false,
}) => {
  return (
    <div className="relative flex flex-col items-center text-center flex-1 min-w-0">
      {/* Horizontal connecting line to next step */}
      {!isLast && (
        <div
          className={`hidden sm:block absolute top-4 left-1/2 w-full h-[2px] transition-colors -z-0 ${
            status === "completed" ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Status icon/circle */}
      <div className="relative z-10 shrink-0">
        {status === "completed" ? (
          <div className="grid size-8 place-items-center rounded-full bg-emerald-500 text-white shadow-sm ring-4 ring-white dark:ring-slate-900">
            <Check className="size-4 stroke-[2.5]" />
          </div>
        ) : status === "running" ? (
          <div className="grid size-8 place-items-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-white dark:ring-slate-900">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : status === "failed" ? (
          <div className="grid size-8 place-items-center rounded-full bg-rose-500 text-white shadow-sm ring-4 ring-white dark:ring-slate-900">
            <AlertCircle className="size-4" />
          </div>
        ) : (
          <div className="grid size-8 place-items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 ring-4 ring-white dark:ring-slate-900">
            {stepNumber}
          </div>
        )}
      </div>

      {/* Texts below */}
      <div className="pt-3 px-1 flex flex-col items-center">
        <h4
          className={`text-xs sm:text-[13px] font-semibold transition-colors leading-tight ${
            status === "completed"
              ? "text-slate-900 dark:text-white"
              : status === "running"
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-snug line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};

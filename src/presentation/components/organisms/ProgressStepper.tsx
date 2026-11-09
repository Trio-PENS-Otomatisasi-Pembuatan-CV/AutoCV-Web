import React from "react";
import { PipelineStageItem, StageStatus } from "../molecules/PipelineStageItem";
import { Button } from "../atoms/Button";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { ArrowRight, Bot, Cpu } from "lucide-react";

export interface ProgressStepperProps {
  jobId: string | null;
  status: JobStatus | string;
  progressPercent: number;
  onContinueToCuration?: () => void;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  jobId,
  status,
  progressPercent,
  onContinueToCuration,
}) => {
  // Map job status to stage statuses
  const getStageStatus = (stageIdx: number): StageStatus => {
    switch (status) {
      case JobStatus.PENDING:
        return stageIdx === 1 ? "running" : "pending";
      case JobStatus.SCRAPING_LINKEDIN:
        if (stageIdx === 1) return "running";
        return "pending";
      case JobStatus.FETCHING_GITHUB:
        if (stageIdx === 1) return "completed";
        if (stageIdx === 2) return "running";
        return "pending";
      case JobStatus.AI_SYNTHESIZING:
        if (stageIdx <= 2) return "completed";
        if (stageIdx === 3) return "running";
        return "pending";
      case JobStatus.AWAITING_CURATION:
      case JobStatus.GENERATING_PDF:
      case JobStatus.DELIVERING_EMAIL:
      case JobStatus.COMPLETED:
        return "completed";
      case JobStatus.FAILED:
        return stageIdx === 1 ? "failed" : "pending";
      default:
        return "pending";
    }
  };

  const isReadyForCuration =
    status === JobStatus.AWAITING_CURATION ||
    status === JobStatus.GENERATING_PDF ||
    status === JobStatus.COMPLETED;

  const isRunning =
    status !== JobStatus.AWAITING_CURATION &&
    status !== JobStatus.COMPLETED &&
    status !== JobStatus.FAILED;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Bot className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Automation Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              job #{jobId || "ACV-2048"} · UiPath Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/50">
              <span className="size-2 rounded-full bg-blue-600 animate-ping" />
              Running Automation...
            </span>
          ) : isReadyForCuration ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
              <span className="size-2 rounded-full bg-emerald-600" />
              Pipeline Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Idle
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
          <span>Processing Pipeline</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stages List (Horizontal Connected Stepper) */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-2 pt-4 relative">
        <PipelineStageItem
          stepNumber={1}
          title="LinkedIn Profile Scraped"
          description="Extracted verified career history, roles & skills"
          status={getStageStatus(1)}
        />
        <PipelineStageItem
          stepNumber={2}
          title="GitHub Repos Fetched"
          description="Analyzed public repositories, commit stats & tech stack"
          status={getStageStatus(2)}
        />
        <PipelineStageItem
          stepNumber={3}
          title="AI STAR Synthesis"
          description="Formulating Situation-Task-Action-Result bullet points"
          status={getStageStatus(3)}
        />
        <PipelineStageItem
          stepNumber={4}
          title="Ready for Human Curation"
          description="Awaiting your selection & edits in Curation Studio"
          status={getStageStatus(4)}
          isLast
        />
      </div>

      {/* Action when ready */}
      {isReadyForCuration && onContinueToCuration && (
        <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Cpu className="size-4 text-blue-600" />
            <span>AI draft ready for review (#HumanInTheLead)</span>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onContinueToCuration}
            icon={<ArrowRight className="size-4" />}
          >
            Open Curation Studio
          </Button>
        </div>
      )}
    </div>
  );
};

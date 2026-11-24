import React, { useState, useEffect } from "react";
import { PipelineStageItem, StageStatus } from "../molecules/PipelineStageItem";
import { Button } from "../atoms/Button";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { ArrowRight, Bot, Cpu, Clock, Activity } from "lucide-react";

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isReadyForCuration =
    status === JobStatus.AWAITING_CURATION ||
    status === JobStatus.GENERATING_PDF ||
    status === JobStatus.COMPLETED;

  const isRunning =
    status !== JobStatus.AWAITING_CURATION &&
    status !== JobStatus.COMPLETED &&
    status !== JobStatus.FAILED;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, jobId]);

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

  const getStatusDetail = () => {
    switch (status) {
      case JobStatus.PENDING:
        return "Connecting to UiPath Orchestrator and dispatching robot...";
      case JobStatus.SCRAPING_LINKEDIN:
        return "Robot is ingesting LinkedIn profile, extracting career experience & certifications...";
      case JobStatus.FETCHING_GITHUB:
        return "Robot is querying GitHub API for public repositories, languages & star metrics...";
      case JobStatus.AI_SYNTHESIZING:
        return "Synthesizing career achievements into ATS-optimized STAR bullet points...";
      case JobStatus.AWAITING_CURATION:
        return "Ingestion & synthesis complete! All career data loaded for your curation.";
      case JobStatus.GENERATING_PDF:
        return "Compiling Word document and rendering ATS-compliant PDF...";
      case JobStatus.DELIVERING_EMAIL:
        return "Sending final PDF resume to your recipient email...";
      case JobStatus.COMPLETED:
        return "All operations complete! Resume is ready for download.";
      case JobStatus.FAILED:
        return "Execution halted. Review error details below.";
      default:
        return "Executing automation pipeline...";
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-7 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Bot className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automation Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              job #{jobId || "ACV-2048"} · UiPath Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/60">
              <Clock className="size-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
              {elapsedSeconds}s / ~30s
            </span>
          )}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/60">
              <span className="size-2 rounded-full bg-blue-600 animate-ping" />
              Running Automation...
            </span>
          ) : isReadyForCuration ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/60">
              <span className="size-2 rounded-full bg-emerald-600" />
              Pipeline Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Idle
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
          <span>Processing Pipeline</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live System Activity Detail */}
        <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 p-3 text-xs text-slate-700 dark:text-slate-300">
          <span className="relative flex size-2.5 mt-0.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full size-2.5 ${
                isRunning ? "bg-blue-600" : isReadyForCuration ? "bg-emerald-600" : "bg-slate-400"
              }`}
            ></span>
          </span>
          <div className="flex-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">{getStatusDetail()}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Host: <strong className="text-slate-600 dark:text-slate-300 font-medium">AutoCV Cloud Orchestrator (LAPTOP-L6K57F1B)</strong> · Target Role: ATS Resume Engine · Cloud Orchestrator Dual-Sync
            </p>
          </div>
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
        <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Cpu className="size-4 text-blue-600 dark:text-blue-400" />
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

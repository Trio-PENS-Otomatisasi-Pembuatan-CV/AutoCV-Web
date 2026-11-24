import React, { useState } from "react";
import { ResumeDocument } from "./ResumeDocument";
import { LivePdfPreviewer } from "./LivePdfPreviewer";
import { WorkflowFlowStepper } from "../molecules/WorkflowFlowStepper";
import { Button } from "../atoms/Button";
import {
  Download,
  FileText,
  Mail,
  Check,
  Printer,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  PlusCircle,
  Eye,
} from "lucide-react";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import type { AtsScoreResult } from "@/core/utils/atsScoreCalculator";
import type { ResumeMetricCard } from "@/core/config/resumeMetrics";

export interface DeliveryViewProps {
  resume: ResumePayload;
  jobId: string | null;
  pdfUrl?: string | null;
  atsScore?: AtsScoreResult;
  formatMetric?: ResumeMetricCard;
  methodologyMetric?: ResumeMetricCard;
  deliveryMetric?: ResumeMetricCard;
  onDownloadPdf: () => void;
  onDownloadWord?: () => void;
  onResendEmail?: () => void;
  onBackToCuration?: () => void;
  onCreateAnother?: () => void;
  isDownloading?: boolean;
  onNavigateStep?: (step: "input" | "curation" | "delivery") => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({
  resume,
  jobId,
  pdfUrl,
  atsScore,
  formatMetric,
  methodologyMetric,
  deliveryMetric,
  onDownloadPdf,
  onDownloadWord,
  onResendEmail,
  onBackToCuration,
  onCreateAnother,
  isDownloading = false,
  onNavigateStep,
}) => {
  const [emailSent, setEmailSent] = useState(false);
  const [viewMode, setViewMode] = useState<"layout" | "pdf">("layout");

  const effectivePdfUrl = pdfUrl || (jobId ? `/api/cv/jobs/${jobId}/download` : null);

  const handleResend = () => {
    if (onResendEmail) {
      onResendEmail();
    }
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full">
      {/* Header section */}
      <section className="text-center print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200/60 dark:ring-emerald-900/60 ring-inset">
          <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ATS Verified &amp; #HumanInTheLead Approved
        </span>
        <h1 className="mx-auto mt-4 max-w-[680px] text-3xl sm:text-[36px] font-bold tracking-tight text-slate-900 dark:text-white">
          Your ATS-Compliant Resume is Ready
        </h1>
        <p className="mx-auto mt-3 max-w-[620px] text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Synthesized from your LinkedIn profile and selected GitHub achievements.
          Strictly formatted into single-column layout to pass modern Applicant Tracking Systems.
        </p>
      </section>

      {/* Stepper Indicator (4-Step Flow) below description */}
      <div className="mt-8 mb-4 max-w-[840px] mx-auto print:hidden">
        <WorkflowFlowStepper
          currentStep="delivery"
          onNavigateStep={onNavigateStep}
        />
      </div>

      {/* Metrics Row */}
      <div className="mx-auto mt-8 grid max-w-[840px] grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            ATS Score
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {atsScore?.label ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {atsScore?.tier ?? ""}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Format
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {formatMetric?.label ?? "Single Column"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {formatMetric?.sublabel ?? "Standard ATS"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Methodology
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {methodologyMetric?.label ?? "STAR Format"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {methodologyMetric?.sublabel ?? "Action Bullets"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Delivery
          </p>
          <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
            {deliveryMetric?.label ?? "UiPath RPA"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {deliveryMetric?.sublabel ?? "Word & PDF Export"}
          </p>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="mx-auto mt-7 max-w-[840px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={onDownloadPdf}
            isLoading={isDownloading}
            icon={<Download className="size-4" />}
          >
            Download PDF
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handlePrint}
            icon={<Printer className="size-4" />}
          >
            Print / Save
          </Button>

          {onDownloadWord && (
            <Button
              variant="secondary"
              size="md"
              onClick={onDownloadWord}
              icon={<FileText className="size-4 text-blue-600 dark:text-blue-400" />}
            >
              Word (.docx)
            </Button>
          )}

          {/* View Mode Switcher */}
          <div className="ml-2 inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode("layout")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === "layout"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Document View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pdf")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === "pdf"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="size-3" /> Live PDF Previewer
            </button>
          </div>
        </div>

        <div className="flex items-center ml-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={handleResend}
            icon={
              emailSent ? (
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Mail className="size-4 text-blue-600 dark:text-blue-400" />
              )
            }
          >
            {emailSent ? "Sent to Email!" : "Resend Email"}
          </Button>
        </div>
      </div>

      {/* Secondary Navigation Row: Back to Curation & Create Another Resume */}
      <div className="mx-auto mt-4 max-w-[840px] flex items-center justify-between px-2 print:hidden">
        {onBackToCuration && (
          <button
            type="button"
            onClick={onBackToCuration}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Back to Edit Curation
          </button>
        )}

        {onCreateAnother && (
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer ml-auto"
          >
            <PlusCircle className="size-3.5" /> Create Another Resume
          </button>
        )}
      </div>

      {/* Main Content Area: Document View OR Live PDF Previewer */}
      <div className="mx-auto mt-7 max-w-[840px]">
        {viewMode === "pdf" ? (
          <LivePdfPreviewer
            pdfUrl={effectivePdfUrl}
            candidateName={resume.profile.fullName}
            onDownloadPdf={onDownloadPdf}
            isDownloading={isDownloading}
          />
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 print:hidden px-2">
              <div className="flex items-center gap-2">
                <span>ATS Document Preview (Standard Letter / A4)</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                  {resume.language === "id" ? "🇮🇩 Bahasa Indonesia" : "🌐 English"}
                </span>
              </div>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" /> ATS Parsable
              </span>
            </div>
            <ResumeDocument resume={resume} language={resume.language} />
          </div>
        )}
      </div>
    </div>
  );
};

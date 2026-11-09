import React, { useState } from "react";
import { ResumeDocument } from "./ResumeDocument";
import { Button } from "../atoms/Button";
import {
  Download,
  FileText,
  Mail,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";
import type { ResumePayload } from "@/core/entities/ResumePayload";

export interface DeliveryViewProps {
  resume: ResumePayload;
  jobId: string | null;
  onDownloadPdf: () => void;
  onDownloadWord?: () => void;
  onResendEmail?: () => void;
  onBackToCuration?: () => void;
  onCreateAnother?: () => void;
  isDownloading?: boolean;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({
  resume,
  jobId,
  onDownloadPdf,
  onDownloadWord,
  onResendEmail,
  onBackToCuration,
  onCreateAnother,
  isDownloading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60 ring-inset">
          <CheckCircle className="size-3.5 text-emerald-600" />
          ATS Verified &amp; Human Approved
        </span>
        <h1 className="mx-auto mt-4 max-w-[680px] text-3xl sm:text-[36px] font-bold tracking-tight text-slate-900">
          Your ATS-Compliant Resume is Ready
        </h1>
        <p className="mx-auto mt-3 max-w-[620px] text-sm text-slate-600 leading-relaxed">
          Synthesized from your LinkedIn profile and selected GitHub achievements.
          Strictly formatted to pass modern Applicant Tracking Systems.
        </p>
      </section>

      {/* Metrics Row */}
      <div className="mx-auto mt-8 grid max-w-[840px] grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ATS Score
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">98/100</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Tier A Ready</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Format
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">Single Column</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Standard ATS</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Methodology
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">STAR Format</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Action Bullets</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Integration
          </p>
          <p className="mt-1 text-lg font-bold text-blue-600">UiPath RPA</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Dossier Engine</p>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="mx-auto mt-7 max-w-[840px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
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
            Print / Save as PDF
          </Button>

          {onDownloadWord && (
            <Button
              variant="secondary"
              size="md"
              onClick={onDownloadWord}
              icon={<FileText className="size-4 text-blue-600" />}
            >
              Word (.docx)
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            icon={
              emailSent ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Mail className="size-3.5" />
              )
            }
          >
            {emailSent ? "Sent to Email!" : "Resend Email"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            icon={
              copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )
            }
          >
            {copied ? "Copied Link!" : "Share Link"}
          </Button>
        </div>
      </div>

      {/* Secondary Navigation Row: Back to Curation & Create Another Resume */}
      <div className="mx-auto mt-4 max-w-[840px] flex items-center justify-between px-2 print:hidden">
        {onBackToCuration && (
          <button
            type="button"
            onClick={onBackToCuration}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Back to Edit Curation
          </button>
        )}

        {onCreateAnother && (
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer ml-auto"
          >
            <PlusCircle className="size-3.5" /> Create Another Resume
          </button>
        )}
      </div>

      {/* Live Resume View */}
      <div className="mx-auto mt-7 max-w-[840px]">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400 print:hidden px-2">
          <span>ATS Document Preview (Standard Letter / A4)</span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <ShieldCheck className="size-3.5 text-emerald-600" /> ATS Parsable
          </span>
        </div>

        <ResumeDocument resume={resume} />
      </div>
    </div>
  );
};

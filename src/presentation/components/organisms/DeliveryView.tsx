import React from "react";
import { Button } from "../atoms/Button";
import { Download, Mail, CheckCircle } from "lucide-react";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import { RESUME_FORMAT_METRIC, RESUME_METHODOLOGY_METRIC, RESUME_DELIVERY_METRIC } from "@/core/config/resumeMetrics";
import type { ResumeMetricCard } from "@/core/config/resumeMetrics";
import type { AtsScoreResult } from "@/core/utils/atsScoreCalculator";

export interface DeliveryViewProps {
  resume: ResumePayload;
  jobId: string | null;
  atsScore: AtsScoreResult;
  formatMetric: ResumeMetricCard;
  methodologyMetric: ResumeMetricCard;
  deliveryMetric: ResumeMetricCard;
  onDownloadPdf: () => void;
  onBackToCuration: () => void;
  onCreateAnother: () => void;
  recipientEmail?: string;
  emailSentTo?: string | null;
  emailSentAt?: string | null;
  isSendingEmail?: boolean;
  emailSendError?: string | null;
  onResendEmail?: () => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({
  resume,
  jobId,
  atsScore,
  formatMetric,
  methodologyMetric,
  deliveryMetric,
  onDownloadPdf,
  onBackToCuration,
  onCreateAnother,
  recipientEmail,
  emailSentTo,
  emailSentAt,
  isSendingEmail,
  emailSendError,
  onResendEmail,
}) => {
  return (
    <div className="w-full">
      <div className="mb-7">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
          Delivery & Export
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Your ATS-optimized resume is ready. Download, share, or send via email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Resume Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <div className="text-xs text-emerald-600 font-medium mb-1">ATS Score</div>
                  <div className="text-2xl font-bold text-emerald-700">{atsScore.label}</div>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <div className="text-xs text-blue-600 font-medium mb-1">Format</div>
                  <div className="text-sm font-bold text-blue-700">{formatMetric.label}</div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <div className="text-xs text-amber-600 font-medium mb-1">Methodology</div>
                  <div className="text-sm font-bold text-amber-700">{methodologyMetric.label}</div>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Download & Share
              </h3>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onDownloadPdf}
                  icon={<Download className="size-4" />}
                >
                  Download PDF Resume
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onBackToCuration}
                  icon={<Mail className="size-4" />}
                >
                  Edit Resume
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs text-slate-500 mb-3 font-medium">
                ATS Compliance Verification
              </p>
              <p className="text-sm text-slate-700">
                Generated using <span className="font-semibold text-blue-600">{deliveryMetric.label}</span> — {deliveryMetric.sublabel} methodology for optimal compatibility with applicant tracking systems.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs print:hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email Delivery
                </p>

                {emailSentTo ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <CheckCircle className="size-4 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700 truncate">
                      {emailSentTo}
                    </span>
                    {emailSentAt && (
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        · {new Date(emailSentAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-600 truncate">
                    {recipientEmail ?? (
                      <span className="italic text-slate-400">No email provided</span>
                    )}
                  </p>
                )}

                {emailSendError && (
                  <p className="mt-1 text-xs text-red-600">{emailSendError}</p>
                )}
              </div>

              <Button
                variant={emailSentTo ? "secondary" : "primary"}
                size="sm"
                onClick={onResendEmail}
                isLoading={isSendingEmail}
                icon={<Mail className="size-4" />}
                disabled={!recipientEmail || isSendingEmail}
                className="flex-shrink-0"
              >
                {emailSentTo ? "Resend" : "Send to Email"}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-[140px] rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 shadow-inner">
            <h3 className="text-xs font-bold text-slate-600 mb-3">
              Your Resume Preview
            </h3>
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="p-4 text-slate-400 text-sm">
                <p className="font-bold text-slate-900 mb-2">
                  {resume.profile.fullName}
                </p>
                <p className="text-xs mb-2">{resume.profile.headline}</p>
                <div className="border-t border-slate-200 my-2"></div>
                <p className="text-[11px] mb-2">
                  <span className="font-medium">Email:</span> {resume.profile.email}
                </p>
                <p className="text-[11px] mb-2">
                  <span className="font-medium">Location:</span> {resume.profile.location}
                </p>
                <p className="text-[11px] line-height-1.4">
                  {resume.profile.summary?.substring(0, 120)}...
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 text-center">
              Full preview → Curation Studio
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          size="md"
          onClick={onBackToCuration}
        >
          Back to Curation
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onCreateAnother}
        >
          Create Another Resume
        </Button>
      </div>
    </div>
  );
}
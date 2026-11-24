import React from "react";
import { Button } from "../atoms/Button";
import { Download, ExternalLink, ShieldCheck, FileCheck } from "lucide-react";

export interface LivePdfPreviewerProps {
  pdfUrl?: string | null;
  candidateName?: string;
  onDownloadPdf: () => void;
  isDownloading?: boolean;
}

export const LivePdfPreviewer: React.FC<LivePdfPreviewerProps> = ({
  pdfUrl,
  candidateName = "Candidate",
  onDownloadPdf,
  isDownloading = false,
}) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileCheck className="size-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Live PDF Previewer (ATS Compliant)
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Interactive view of the generated ATS resume compiled by UiPath Robot
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ExternalLink className="size-3.5" /> Open in New Tab
            </a>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={onDownloadPdf}
            isLoading={isDownloading}
            icon={<Download className="size-4" />}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="relative min-h-[560px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`ATS Resume - ${candidateName}`}
            className="size-full min-h-[560px] border-0"
          />
        ) : (
          <div className="flex min-h-[560px] flex-col items-center justify-center p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-3">
              <FileCheck className="size-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              PDF Generated &amp; Ready
            </h4>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Click the button below to download or view the compiled ATS resume document.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                size="md"
                onClick={onDownloadPdf}
                isLoading={isDownloading}
                icon={<Download className="size-4" />}
              >
                Download ATS Resume PDF
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="size-3.5" /> 100% Parsable ATS Layout
        </span>
        <span>Standard Letter / A4 Format</span>
      </div>
    </div>
  );
};

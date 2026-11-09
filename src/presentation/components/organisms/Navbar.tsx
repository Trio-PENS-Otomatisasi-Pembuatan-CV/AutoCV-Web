import React from "react";
import { History, ChevronDown } from "lucide-react";

export interface NavbarProps {
  onExportHistoryClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExportHistoryClick }) => {
  return (
    <header className="z-30 h-[68px] border-b border-slate-200 bg-white sticky top-0 print:hidden">
      <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#0F172A" />
              <path
                d="M10 8.5h8.2L23 13.3V23a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 10 23V8.5Z"
                fill="#fff"
              />
              <path
                d="M18.2 8.5V13h4.8"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
              <rect
                x="12.6"
                y="16"
                width="7.6"
                height="1.5"
                rx=".75"
                fill="#2563EB"
              />
              <rect
                x="12.6"
                y="19.2"
                width="5.2"
                height="1.5"
                rx=".75"
                fill="#94A3B8"
              />
            </svg>
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              AutoCV
            </span>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500">
            ATS Engine v2.4
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExportHistoryClick}
            aria-label="Export History"
            title="Export History"
            className="grid size-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <History className="size-4.5" />
          </button>

          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1 transition-colors hover:bg-slate-50"
          >
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-[11px] font-semibold text-white">
              JD
            </span>
            <span className="text-[13px] font-medium text-slate-900">
              John Doe
            </span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

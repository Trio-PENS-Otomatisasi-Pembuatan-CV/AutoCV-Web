import React from "react";
import { ArrowLeft } from "lucide-react";

export interface NavbarProps {
  onBackToInput?: () => void;
  activeProfileName?: string;
  activeProfileHeadline?: string;
  onExportHistoryClick?: () => void;
  onSignOut?: () => void;
  userName?: string;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBackToInput,
  activeProfileName,
  activeProfileHeadline,
}) => {
  return (
    <header className="z-30 h-14 border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 print:hidden">
      <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo + Divider + Breadcrumb/Back button + Active Profile */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
              <rect width="32" height="32" rx="7" fill="#0F172A" />
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
            <span className="text-[16px] font-bold tracking-tight text-slate-900">
              AutoCV
            </span>
          </div>

          {onBackToInput && (
            <>
              <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />
              <button
                type="button"
                onClick={onBackToInput}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="size-3.5" />
                <span>Profiles</span>
              </button>
            </>
          )}

          {activeProfileName && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 min-w-0 truncate">
              <span>/</span>
              <span className="font-semibold text-slate-700 truncate max-w-[200px] md:max-w-[280px]">
                {activeProfileName}
                {activeProfileHeadline && (
                  <span className="font-normal text-slate-400 hidden md:inline">
                    {" "}— {activeProfileHeadline}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Status Indicator (● Auto-saved) + Subtle Engine Version */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-saved
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10.5px] font-medium text-slate-400">
            v2.4
          </span>
        </div>
      </div>
    </header>
  );
};

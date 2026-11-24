import React from "react";
import { ArrowLeft, Sun, Moon } from "lucide-react";

export interface NavbarProps {
  onBackToInput?: () => void;
  activeProfileName?: string;
  activeProfileHeadline?: string;
  onExportHistoryClick?: () => void;
  onSignOut?: () => void;
  userName?: string;
  userEmail?: string;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBackToInput,
  activeProfileName,
  activeProfileHeadline,
  isDark = false,
  onToggleTheme,
}) => {
  return (
    <header className="z-30 h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 print:hidden transition-colors duration-200">
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
            <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white">
              AutoCV
            </span>
          </div>

          {onBackToInput && (
            <>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />
              <button
                type="button"
                onClick={onBackToInput}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="size-3.5" />
                <span>Profiles</span>
              </button>
            </>
          )}

          {activeProfileName && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 min-w-0 truncate">
              <span>/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] md:max-w-[280px]">
                {activeProfileName}
                {activeProfileHeadline && (
                  <span className="font-normal text-slate-400 dark:text-slate-500 hidden md:inline">
                    {" "}— {activeProfileHeadline}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Status Indicator (● Auto-saved) + Dark Mode Toggle + Version */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-3 py-1 rounded-full shadow-xs">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500 shadow-xs" />
            </span>
            <span className="font-semibold text-[11.5px]">Auto-saved</span>
          </span>

          {/* Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs cursor-pointer"
              title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
          )}

          <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 font-mono text-[10.5px] font-medium text-slate-400 dark:text-slate-500">
            v2.4
          </span>
        </div>
      </div>
    </header>
  );
};

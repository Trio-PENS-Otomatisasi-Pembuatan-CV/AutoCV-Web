import React, { useState, useRef, useEffect } from "react";
import { History, ChevronDown, LogOut, User } from "lucide-react";

export interface NavbarProps {
  onExportHistoryClick?: () => void;
  onSignOut?: () => void;
  userName?: string;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExportHistoryClick,
  onSignOut,
  userName = "John Doe",
  userEmail = "john.doe@company.com",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1 transition-colors hover:bg-slate-50"
            >
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-[11px] font-semibold text-white">
                {initials}
              </span>
              <span className="text-[13px] font-medium text-slate-900 hidden sm:inline">
                {userName}
              </span>
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {userEmail}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

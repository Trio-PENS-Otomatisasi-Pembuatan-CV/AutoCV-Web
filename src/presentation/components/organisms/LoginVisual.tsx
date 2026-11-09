import React from "react";
import { Check, Sparkles, CheckCircle2 } from "lucide-react";

export const LoginVisual: React.FC = () => {
  return (
    <div className="sticky top-0 hidden lg:block h-screen min-h-[600px] overflow-hidden border-l border-slate-200">
      <div
        className="relative isolate h-full w-full overflow-hidden flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle, rgb(238, 242, 255) 0%, rgb(248, 250, 252) 70%)",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(rgb(148, 163, 184) 1.2px, transparent 1.2px), linear-gradient(rgb(148, 163, 184) 1px, transparent 1px), linear-gradient(90deg, rgb(148, 163, 184) 1px, transparent 1px)",
            backgroundSize: "20px 20px, 120px 120px, 120px 120px",
            backgroundPosition: "center center",
            maskImage: "radial-gradient(circle, rgb(0, 0, 0) 50%, transparent 85%)",
          }}
        />

        {/* Central Graphic Container */}
        <div className="relative shrink-0 w-[580px] h-[680px]">
          {/* Ambient Glow */}
          <div
            className="absolute size-[400px] rounded-full bg-[#60A5FA] opacity-[0.14] blur-3xl pointer-events-none"
            aria-hidden="true"
            style={{ left: "90px", top: "180px" }}
          />

          {/* SVG Connecting Animated Beams */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="580"
            height="680"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="beam-li"
                x1="0"
                y1="104"
                x2="0"
                y2="196"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#0A66C2" stopOpacity="0.6" />
                <stop offset="1" stopColor="#2563EB" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient
                id="beam-gh"
                x1="0"
                y1="104"
                x2="0"
                y2="196"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#24292F" stopOpacity="0.6" />
                <stop offset="1" stopColor="#2563EB" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* LinkedIn Beam */}
            <g>
              <path
                d="M 150 100 C 150 155, 235 150, 260 196"
                stroke="url(#beam-li)"
                strokeWidth="1.8"
                strokeDasharray="3 5"
                strokeLinecap="round"
              />
              <circle r="3" fill="#2563EB">
                <animateMotion
                  dur="2.4s"
                  repeatCount="indefinite"
                  path="M 150 100 C 150 155, 235 150, 260 196"
                  begin="0s"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2.4s"
                  repeatCount="indefinite"
                  begin="0s"
                />
              </circle>
            </g>

            {/* GitHub Beam */}
            <g>
              <path
                d="M 430 100 C 430 155, 345 150, 320 196"
                stroke="url(#beam-gh)"
                strokeWidth="1.8"
                strokeDasharray="3 5"
                strokeLinecap="round"
              />
              <circle r="3" fill="#2563EB">
                <animateMotion
                  dur="2.4s"
                  repeatCount="indefinite"
                  path="M 430 100 C 430 155, 345 150, 320 196"
                  begin="1.2s"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2.4s"
                  repeatCount="indefinite"
                  begin="1.2s"
                />
              </circle>
            </g>

            <circle
              cx="290"
              cy="196"
              r="4"
              fill="#fff"
              stroke="#93C5FD"
              strokeWidth="1.5"
            />
          </svg>

          {/* Node 1: LinkedIn Profile (Top-Left) */}
          <div className="absolute top-8 left-8 w-[190px]">
            <div
              className="absolute -inset-1 rounded-2xl blur-md opacity-25"
              style={{ background: "#0A66C2" }}
            />
            <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pr-3.5 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50">
                <svg
                  viewBox="0 0 24 24"
                  className="size-4.5 text-[#0A66C2]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  LinkedIn Profile
                </p>
                <p className="font-mono text-[10.5px] text-slate-500">
                  Exp &amp; Skills
                </p>
              </div>
              <span className="ml-auto size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_#D1FAE5]" />
            </div>
          </div>

          {/* Node 2: GitHub Graph (Top-Right) */}
          <div className="absolute top-8 right-8 w-[190px]">
            <div
              className="absolute -inset-1 rounded-2xl blur-md opacity-25"
              style={{ background: "#475569" }}
            />
            <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pr-3.5 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50">
                <svg
                  viewBox="0 0 24 24"
                  className="size-4.5 text-[#24292F]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.33-1.77-1.33-1.77-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  GitHub Graph
                </p>
                <p className="font-mono text-[10.5px] text-slate-500">
                  Repos &amp; Stars
                </p>
              </div>
              <span className="ml-auto size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_#D1FAE5]" />
            </div>
          </div>

          {/* Central Card: Floating ATS Dossier Preview */}
          <div
            className="absolute flex flex-col rounded-2xl border border-white/80 bg-white/85 p-5 backdrop-blur-md shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
            style={{
              left: "120px",
              top: "190px",
              width: "340px",
              height: "410px",
              boxShadow:
                "rgba(37, 99, 235, 0.12) 0px 20px 32px -15px, rgba(15, 23, 42, 0.04) 0px 1px 2px",
            }}
          >
            {/* Dossier Header */}
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-semibold text-white ring-2 ring-white">
                AR
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-slate-900">
                  Alex Rivera
                </p>
                <p className="truncate text-[11.5px] text-slate-500">
                  Lead Fullstack Engineer
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10.5px] font-semibold text-white">
                <CheckCircle2 className="size-3" /> ATS: 98%
              </span>
            </div>

            <div className="my-3.5 h-px bg-slate-200/80" />

            {/* Repositories section */}
            <p className="font-mono text-[9.5px] font-bold tracking-[0.12em] text-slate-400">
              TECHNICAL REPOSITORIES
            </p>
            <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                  ecommerce-microservice
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10.5px] text-slate-500">
                Go • Docker • 48★
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                • Reduced latency by{" "}
                <mark className="rounded bg-emerald-100 px-1 font-semibold text-emerald-800">
                  35%
                </mark>{" "}
                using RabbitMQ event stream
              </p>
            </div>

            {/* Skeleton Placeholders */}
            <div className="mt-3.5 space-y-2 pl-1">
              <span className="block h-2 rounded-full bg-slate-200/80 w-[92%]" />
              <span className="block h-2 rounded-full bg-slate-200/80 w-[78%]" />
            </div>

            <p className="mt-4 font-mono text-[9.5px] font-bold tracking-[0.12em] text-slate-400">
              WORK EXPERIENCE
            </p>
            <div className="mt-2 space-y-2 pl-1">
              <div className="flex items-center justify-between">
                <span className="block h-2 rounded-full bg-slate-300/80 w-[48%]" />
                <span className="block h-2 rounded-full bg-slate-200/80 w-[18%]" />
              </div>
              <span className="block h-2 rounded-full bg-slate-200/80 w-[88%]" />
              <span className="block h-2 rounded-full bg-slate-200/80 w-[70%]" />
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-200/80 pt-3 font-mono text-[10.5px] text-slate-400">
              <span>Single-column · ATS safe</span>
              <span>1 / 1</span>
            </div>
          </div>

          {/* Floating Badge 1: STAR Method (Top right of card) */}
          <div
            className="absolute inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md border border-slate-200 bg-white text-slate-800"
            style={{ left: "385px", top: "160px" }}
          >
            STAR Method
            <Check className="size-3.5 text-emerald-600 stroke-[3]" />
          </div>

          {/* Floating Badge 2: UiPath Orchestrator (Bottom left) */}
          <div
            className="absolute inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-md border border-slate-200 bg-white text-slate-700"
            style={{ left: "20px", top: "545px" }}
          >
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
              <rect width="20" height="20" rx="5" fill="#FA4616" />
              <rect
                x="3.5"
                y="3.5"
                width="13"
                height="13"
                rx="2.5"
                fill="none"
                stroke="#fff"
                strokeWidth="1.4"
              />
              <path
                d="M6.6 7.2v3.4a1.7 1.7 0 0 0 3.4 0V7.2"
                fill="none"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M12.8 9v4"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="12.8" cy="7.1" r=".9" fill="#fff" />
            </svg>
            UiPath Orchestrator:{" "}
            <span className="font-semibold text-emerald-600">Connected</span>
          </div>

          {/* Floating Badge 3: #HumanInTheLead (Bottom right) */}
          <div
            className="absolute inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md border border-indigo-100 bg-indigo-50 text-indigo-700"
            style={{ left: "375px", top: "600px" }}
          >
            <Sparkles className="size-3.5 text-indigo-600" />
            #HumanInTheLead
          </div>
        </div>
      </div>
    </div>
  );
};

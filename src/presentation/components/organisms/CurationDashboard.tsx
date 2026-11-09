import React from "react";
import { ProjectCard } from "../molecules/ProjectCard";
import { ExperienceItem } from "../molecules/ExperienceItem";
import { ResumeDocument } from "./ResumeDocument";
import { Button } from "../atoms/Button";
import { Sparkles, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import type { ResumePayload } from "@/core/entities/ResumePayload";

export interface CurationDashboardProps {
  resume: ResumePayload;
  onUpdateSummary: (summary: string) => void;
  onToggleProject: (projectId: string) => void;
  onUpdateExperienceBullets: (expId: string, bullets: string[]) => void;
  onRegenerateSummary: () => void;
  onRerunSynthesis: () => void;
  onApprove: () => void;
  isApproving?: boolean;
}

export const CurationDashboard: React.FC<CurationDashboardProps> = ({
  resume,
  onUpdateSummary,
  onToggleProject,
  onUpdateExperienceBullets,
  onRegenerateSummary,
  onRerunSynthesis,
  onApprove,
  isApproving = false,
}) => {
  const selectedCount = resume.projects.filter((p) => p.isSelected !== false).length;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Dossier</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">
              {resume.profile.fullName} — {resume.profile.headline || "Candidate"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
            Curation Studio: Review & Direct AI Draft
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            <span className="font-semibold text-blue-600">#HumanInTheLead:</span> You
            control which repositories are featured and refine bullet points before
            final compilation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
            <ShieldCheck className="size-4 text-emerald-600" />
            ATS Compliant Format
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor controls (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Professional Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Professional Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Tailored to your target job role
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={onRegenerateSummary}
                icon={<Sparkles className="size-3 text-blue-600" />}
              >
                Regenerate with AI
              </Button>
            </div>
            <textarea
              rows={4}
              value={resume.profile.summary}
              onChange={(e) => onUpdateSummary(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-800 leading-relaxed outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="Write or refine summary..."
            />
          </div>

          {/* Section 2: Featured GitHub Repositories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Select Featured GitHub Repositories
                </h3>
                <p className="text-xs text-slate-500">
                  Choose 2–3 best repositories ({selectedCount} selected)
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedCount >= 2 && selectedCount <= 3
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {selectedCount} of 3
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {resume.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={project.isSelected !== false}
                  onToggle={onToggleProject}
                />
              ))}
            </div>
          </div>

          {/* Section 3: Work Experience & Bullets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Work Experience & Skills
              </h3>
              <p className="text-xs text-slate-500">
                Refine STAR bullet points for maximum impact
              </p>
            </div>

            <div className="space-y-3">
              {resume.experiences.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  experience={exp}
                  onUpdateBullets={onUpdateExperienceBullets}
                />
              ))}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky bottom-20 z-20">
            <Button
              variant="secondary"
              size="md"
              onClick={onRerunSynthesis}
              icon={<RotateCcw className="size-4" />}
            >
              Re-run AI Synthesis
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={onApprove}
              isLoading={isApproving}
              icon={<CheckCircle2 className="size-4.5" />}
            >
              {isApproving
                ? "Generating ATS Resume..."
                : "Approve & Generate ATS Resume"}
            </Button>
          </div>
        </div>

        {/* Right Column: Sticky Live Resume Preview (5 cols on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-[90px]">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live ATS Preview
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Synced
            </span>
          </div>

          <div className="max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100/60 p-3 sm:p-4 shadow-inner">
            <ResumeDocument resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
};

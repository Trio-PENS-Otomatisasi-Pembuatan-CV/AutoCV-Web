import React, { useState } from "react";
import { ProjectCard } from "../molecules/ProjectCard";
import { ExperienceItem } from "../molecules/ExperienceItem";
import { CustomSectionItem } from "../molecules/CustomSectionItem";
import { ResumeDocument } from "./ResumeDocument";
import { WorkflowFlowStepper } from "../molecules/WorkflowFlowStepper";
import { Button } from "../atoms/Button";
import { TextInput } from "../atoms/TextInput";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  User,
  Briefcase,
  Mail,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
} from "lucide-react";
import type { ResumePayload, ResumeLanguage, CustomSection } from "@/core/entities/ResumePayload";

export interface CurationDashboardProps {
  resume: ResumePayload;
  language?: ResumeLanguage;
  onUpdateProfile?: (updates: Partial<ResumePayload["profile"]>) => void;
  onUpdateSummary: (summary: string) => void;
  onToggleProject: (projectId: string) => void;
  onToggleExperience?: (expId: string) => void;
  onUpdateExperienceBullets: (expId: string, bullets: string[]) => void;
  onUpdateSkillCategoryItems?: (categoryIndex: number, itemsString: string) => void;
  onAddCustomSection?: (title: string) => void;
  onUpdateCustomSection?: (id: string, updates: Partial<CustomSection>) => void;
  onRemoveCustomSection?: (id: string) => void;
  onRegenerateSummary: () => void;
  onRequestAIRewrite?: () => void;
  onRerunSynthesis: () => void;
  onApprove: () => void;
  onBackToInput?: () => void;
  isApproving?: boolean;
  onNavigateStep?: (step: "input" | "curation" | "delivery") => void;
}

export const CurationDashboard: React.FC<CurationDashboardProps> = ({
  resume,
  language,
  onUpdateProfile,
  onUpdateSummary,
  onToggleProject,
  onToggleExperience,
  onUpdateExperienceBullets,
  onUpdateSkillCategoryItems,
  onAddCustomSection,
  onUpdateCustomSection,
  onRemoveCustomSection,
  onRegenerateSummary,
  onRequestAIRewrite,
  onRerunSynthesis,
  onApprove,
  onBackToInput,
  isApproving = false,
  onNavigateStep,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  const selectedCount = resume.projects.filter((p) => p.isSelected !== false).length;
  const selectedExpCount = resume.experiences.filter((e) => e.isSelected !== false).length;
  const handleRewrite = onRequestAIRewrite || onRegenerateSummary || onRerunSynthesis;

  const customSectionCompleteness = (resume.customSections || []).some(
    (s) => s.title.trim() && s.items.some((i) => i.title.trim() || i.description.trim())
  );

  // Completion calculation for Section Stepper / Anchor Navigation
  const sections = [
    {
      id: "section-profile",
      label: "Candidate Profile",
      isComplete: Boolean(resume.profile.fullName?.trim() && resume.profile.email?.trim()),
    },
    {
      id: "section-summary",
      label: "Professional Summary",
      isComplete: Boolean(resume.profile.summary?.trim() && resume.profile.summary.trim().length > 20),
    },
    {
      id: "section-projects",
      label: "Featured Repositories",
      isComplete: selectedCount >= 1,
      badge: `${selectedCount} selected`,
    },
    {
      id: "section-experience",
      label: "Work Experience",
      isComplete: selectedExpCount >= 1,
      badge: `${selectedExpCount} selected`,
    },
    {
      id: "section-skills",
      label: "Technical Skills",
      isComplete: resume.skills.some((s) => s.items.length > 0),
    },
    {
      id: "section-custom",
      label: "Custom Sections",
      isComplete: customSectionCompleteness,
    },
  ];

  const completedSectionsCount = sections.filter((s) => s.isComplete).length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full">
      {/* 2. Compact Page Header & Microcopy */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Curation Studio
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Review your details, refine AI-generated bullet points, and curate key projects before
          compiling your final resume.
        </p>

        {/* Stepper Indicator (4-Step Flow) below description */}
        <div className="mt-5 mb-3">
          <WorkflowFlowStepper
            currentStep="curation"
            onNavigateStep={onNavigateStep}
          />
        </div>

        {/* 4a. Completeness Indicator & Anchor Navigation */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  sec.isComplete
                    ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    sec.isComplete ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
                <span>{sec.label}</span>
                {sec.badge && (
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                    ({sec.badge})
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-auto hidden sm:inline">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{completedSectionsCount}</span> of{" "}
            {sections.length} sections complete
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor controls (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 0: Candidate Profile Details */}
          <div
            id="section-profile"
            className="scroll-mt-20 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 sm:p-6 shadow-xs"
          >
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="size-4 text-blue-600 dark:text-blue-400" />
                Candidate Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Edit your official name, target headline, and contact info
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <TextInput
                  value={resume.profile.fullName}
                  onChange={(e) => onUpdateProfile?.({ fullName: e.target.value })}
                  placeholder="e.g. Fajrul Fatih"
                  leftIcon={<User className="size-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Professional Headline
                </label>
                <TextInput
                  value={resume.profile.headline || ""}
                  onChange={(e) => onUpdateProfile?.({ headline: e.target.value })}
                  placeholder="e.g. Software Engineer | Fullstack Developer"
                  leftIcon={<Briefcase className="size-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <TextInput
                  type="email"
                  value={resume.profile.email || ""}
                  onChange={(e) => onUpdateProfile?.({ email: e.target.value })}
                  placeholder="e.g. name@example.com"
                  leftIcon={<Mail className="size-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Location (City, Country)
                </label>
                <TextInput
                  value={resume.profile.location || ""}
                  onChange={(e) => onUpdateProfile?.({ location: e.target.value })}
                  placeholder="e.g. Surabaya, Indonesia"
                  leftIcon={<MapPin className="size-4" />}
                />
              </div>
            </div>
          </div>

          {/* Section 1: Professional Summary */}
          <div
            id="section-summary"
            className="scroll-mt-20 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Professional Summary
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tailored to your target job role
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRewrite}
                icon={<Sparkles className="size-3 text-blue-600 dark:text-blue-400" />}
              >
                Request AI Rewrite
              </Button>
            </div>
            <textarea
              rows={4}
              value={resume.profile.summary}
              onChange={(e) => onUpdateSummary(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 p-3.5 text-xs text-slate-800 dark:text-slate-100 leading-relaxed outline-none transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Write or refine summary..."
            />
          </div>

          {/* Section 2: Featured GitHub Repositories */}
          <div
            id="section-projects"
            className="scroll-mt-20 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Select Featured GitHub Repositories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Checklist repositori proyek ({selectedCount} of {resume.projects.length} dipilih)
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedCount > 4
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60"
                    : selectedCount >= 1 && selectedCount <= 4
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                }`}
              >
                {selectedCount > 4
                  ? `${selectedCount} of ${resume.projects.length} selected (> 4 dipilih)`
                  : selectedCount === 0
                  ? "Pilih minimal 1 repository"
                  : `${selectedCount} of ${resume.projects.length} selected (Optimal)`}
              </span>
            </div>

            {/* Warning Banner if more than 4 repositories are checked */}
            {selectedCount > 4 && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/50 p-3.5 text-xs text-amber-900 dark:text-amber-200 transition-all">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Perhatian: {selectedCount} repositori dipilih (Melebihi rekomendasi 4 proyek)
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Memilih lebih dari 4 repositori dapat membuat resume melebihi 2 halaman dan kurang optimal untuk sistem ATS. Anda tetap dapat melanjutkan jika ingin menampilkan seluruh repositori ini.
                  </p>
                </div>
              </div>
            )}

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
          <div
            id="section-experience"
            className="scroll-mt-20 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Work Experience Highlights
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose relevant experiences ({selectedExpCount} selected) and refine STAR bullets
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedExpCount > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60"
                }`}
              >
                {selectedExpCount} of {resume.experiences.length} selected
              </span>
            </div>

            <div className="space-y-3">
              {resume.experiences.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  experience={exp}
                  isSelected={exp.isSelected !== false}
                  onToggle={onToggleExperience}
                  onUpdateBullets={onUpdateExperienceBullets}
                />
              ))}
            </div>
          </div>

          {/* Section 4: Technical Skills Editor */}
          <div
            id="section-skills"
            className="scroll-mt-20 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 sm:p-6 shadow-xs"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="size-4 text-blue-600 dark:text-blue-400" />
                  Technical Skills &amp; Competencies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Edit comma-separated skill keywords per category
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {resume.skills.map((category, idx) => (
                <div
                  key={category.category || idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 transition-colors focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {category.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {category.items.length} skills
                    </span>
                  </div>
                  <input
                    type="text"
                    value={category.items.join(", ")}
                    onChange={(e) => {
                      if (onUpdateSkillCategoryItems) {
                        onUpdateSkillCategoryItems(idx, e.target.value);
                      }
                    }}
                    placeholder="Enter skills separated by commas (e.g. TypeScript, React, Go)"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              ))}
</div>
          </div>

          {/* Section 5: Custom Sections Editor */}
          {resume.customSections !== undefined && (
            <div
              id="section-custom"
              className="scroll-mt-20 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Custom Sections
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add user-defined sections (e.g. Certifications, Awards, Projects)
                  </p>
                </div>
                {onAddCustomSection && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAddCustomSection("")}
                    icon={<Plus className="size-3.5" />}
                  >
                    Add Section
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {resume.customSections.map((section) => (
                  <CustomSectionItem
                    key={section.id}
                    section={section}
                    onUpdateSection={onUpdateCustomSection}
                    onRemoveSection={onRemoveCustomSection}
                  />
                ))}
                {(resume.customSections?.length ?? 0) === 0 && onAddCustomSection && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No custom sections yet. Click &#x27;Add Section&#x27; to begin.</p>
                )}
              </div>
            </div>
          )}

          {/* Docked Sticky Footer */}
          <div className="sticky bottom-0 z-30 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.10)] ring-1 ring-slate-900/[0.04]">
            <div className="flex items-center gap-2.5">
              {onBackToInput && (
                <button
                  type="button"
                  onClick={onBackToInput}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRewrite}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Rewrite Entire CV</span>
              </button>
            </div>

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

        {/* Right Column: Sticky Live Resume Preview (5 cols on desktop, stick to screen) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 z-20">
          <div className="mb-2.5 flex items-center justify-between px-1 gap-2 flex-wrap sm:flex-nowrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
              Live ATS Preview
            </span>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(60, z - 10))}
                  disabled={zoom <= 60}
                  className="size-6 flex items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
                  title="Reset Zoom to 100%"
                >
                  {zoom}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                  disabled={zoom >= 150}
                  className="size-6 flex items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(zoom === 85 ? 100 : 85)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 rounded border-l border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  title="Fit to Width (85%)"
                >
                  <Maximize2 className="size-2.5" />
                  Fit
                </button>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/60 shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime Synced
              </span>
            </div>
          </div>

          <div className="max-h-[calc(100vh-140px)] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 p-3 sm:p-4 shadow-inner">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
                width: zoom !== 100 ? `${100 * (100 / zoom)}%` : "100%",
              }}
            >
              <ResumeDocument resume={resume} language={language || resume.language} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

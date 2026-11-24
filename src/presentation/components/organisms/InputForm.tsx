import React from "react";
import { FormField } from "../molecules/FormField";
import { TextInput } from "../atoms/TextInput";
import { Button } from "../atoms/Button";
import { WorkflowFlowStepper } from "../molecules/WorkflowFlowStepper";
import { Sparkles, Briefcase, Mail } from "lucide-react";
import type { ResumeLanguage } from "@/core/entities/ResumePayload";
import { useTypewriter } from "@/presentation/hooks/useTypewriter";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export interface InputFormData {
  linkedinUrl: string;
  githubUrl: string;
  targetRole: string;
  recipientEmail: string;
  language?: ResumeLanguage;
}

export interface InputFormProps {
  formData: InputFormData;
  onChange: (field: keyof InputFormData, value: string) => void;
  onUseSample: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  errors?: Partial<Record<keyof InputFormData, string>>;
  onNavigateStep?: (step: "input" | "curation" | "delivery") => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  formData,
  onChange,
  onUseSample,
  onSubmit,
  isLoading = false,
  errors = {},
  onNavigateStep,
}) => {
  // Hero dynamic typewriter rotating phrases
  const { displayedText } = useTypewriter({
    words: [
      "ATS-Optimized Technical Resume",
      "Verified Engineering Dossier",
      "High-Impact Developer Portfolio",
    ],
    typingSpeed: 60,
    deletingSpeed: 30,
    pauseDuration: 2200,
  });

  // Real-time URL and email validation
  const isValidLinkedIn = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/.test(
    formData.linkedinUrl?.trim() || ""
  );
  const isValidGithub = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9._-]+)?\/?$/.test(
    formData.githubUrl?.trim() || ""
  );
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    formData.recipientEmail?.trim() || ""
  );

  return (
    <div className="relative w-full pb-8">
      {/* 1. Hero Header with Staggered Entrance & Typewriter Effect */}
      <section className="text-center pt-2">
        {/* Badge: Updated micro-copy */}
        <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-blue-200/80 dark:border-blue-900/60 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 shadow-xs backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-blue-600" />
          </span>
          <span>Human-in-the-Loop Automation · UiPath Core</span>
        </div>

        {/* Big Title with Dynamic Typewriter Effect & Zero Layout Shift */}
        <h1 className="mx-auto mt-6 max-w-[780px] text-3xl sm:text-[42px] leading-[1.16] font-black tracking-tight text-slate-900 dark:text-white">
          <span className="block animate-fade-in-up anim-delay-75">
            Transform Raw Profiles
          </span>
          <span className="block animate-fade-in-up anim-delay-150 text-slate-800 dark:text-slate-200">
            into an{" "}
          </span>
          <span className="inline-block animate-fade-in-up anim-delay-225 min-h-[1.25em]">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {displayedText}
            </span>
            <span
              className="inline-block w-[3px] h-[26px] sm:h-[36px] ml-1.5 bg-blue-600 dark:bg-blue-400 animate-pulse rounded-full align-middle shadow-xs"
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Subtext: Fade-in Last */}
        <p className="animate-fade-in-up anim-delay-300 mx-auto mt-4 max-w-[620px] text-base leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
          AutoCV extracts your verified career history from LinkedIn and real
          repo achievements from GitHub, ready for your curation.
        </p>
      </section>

      {/* Stepper Indicator (4-Step Flow) below description */}
      <div className="mt-8 mb-2">
        <WorkflowFlowStepper
          currentStep="input"
          isRunningJob={isLoading}
          onNavigateStep={onNavigateStep}
        />
      </div>

      {/* Kartu Utama Glassmorphism & Micro-Interactions */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="animate-fade-in-up anim-delay-375 mt-3 rounded-3xl border border-white/60 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.04] transition-all duration-300"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Source profiles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Public data only. Nothing is published without your approval.
            </p>
          </div>
          <button
            type="button"
            onClick={onUseSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="size-3 text-blue-500" />
            <span>✨ Use Sample Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Row 1: LinkedIn URL with real-time green checkmark validation */}
          <div className="animate-fade-in-up anim-delay-450">
            <FormField
              label="LinkedIn Profile URL"
              htmlFor="linkedinUrl"
              error={errors.linkedinUrl}
              required
            >
              <TextInput
                id="linkedinUrl"
                placeholder="https://linkedin.com/in/johndoe"
                value={formData.linkedinUrl}
                onChange={(e) => onChange("linkedinUrl", e.target.value)}
                leftIcon={<LinkedinIcon className="size-4" />}
                isValid={isValidLinkedIn}
                error={errors.linkedinUrl}
                disabled={isLoading}
              />
            </FormField>
          </div>

          {/* GitHub URL with real-time green checkmark validation */}
          <div className="animate-fade-in-up anim-delay-450">
            <FormField
              label="GitHub Profile URL"
              htmlFor="githubUrl"
              error={errors.githubUrl}
              required
            >
              <TextInput
                id="githubUrl"
                placeholder="https://github.com/johndoe"
                value={formData.githubUrl}
                onChange={(e) => onChange("githubUrl", e.target.value)}
                leftIcon={<GithubIcon className="size-4" />}
                isValid={isValidGithub}
                error={errors.githubUrl}
                disabled={isLoading}
              />
            </FormField>
          </div>

          {/* Row 2: Target Role */}
          <div className="animate-fade-in-up anim-delay-525">
            <FormField
              label="Target Job Role (Optional)"
              htmlFor="targetRole"
              caption="Aligns ATS keywords to this role"
              error={errors.targetRole}
            >
              <TextInput
                id="targetRole"
                placeholder="Senior Fullstack Engineer / DevOps Engineer"
                value={formData.targetRole}
                onChange={(e) => onChange("targetRole", e.target.value)}
                leftIcon={<Briefcase className="size-4" />}
                error={errors.targetRole}
                disabled={isLoading}
              />
            </FormField>
          </div>

          {/* Recipient Email with real-time green checkmark validation */}
          <div className="animate-fade-in-up anim-delay-525">
            <FormField
              label="Recipient Email"
              htmlFor="recipientEmail"
              caption="Final PDF will also be dispatched here"
              error={errors.recipientEmail}
              required
            >
              <TextInput
                id="recipientEmail"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.recipientEmail}
                onChange={(e) => onChange("recipientEmail", e.target.value)}
                leftIcon={<Mail className="size-4" />}
                isValid={isValidEmail}
                error={errors.recipientEmail}
                disabled={isLoading}
              />
            </FormField>
          </div>

          {/* 4. Segmented Control for Target Resume Language */}
          <div className="md:col-span-2 animate-fade-in-up anim-delay-600">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Target Resume Language
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Optimizes action verbs, metrics, and ATS headings
                </p>
              </div>
            </div>

            <div className="p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => onChange("language", "en")}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  formData.language === "en"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700 scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-xl">🌐</span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-900 dark:text-white">English</span>
                    {formData.language === "en" && (
                      <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10.5px] font-normal text-slate-500 dark:text-slate-400">
                    Global &amp; MNC Roles
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChange("language", "id")}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  (formData.language || "id") === "id"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700 scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-xl">🇮🇩</span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-900 dark:text-white">Bahasa Indonesia</span>
                    {(formData.language || "id") === "id" && (
                      <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10.5px] font-normal text-slate-500 dark:text-slate-400">
                    Lokal, BUMN, &amp; Korporat
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 5. CTA Submit Button */}
        <div className="mt-8 animate-fade-in-up anim-delay-600">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-12 text-sm sm:text-base font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all duration-200"
            isLoading={isLoading}
            icon={<Sparkles className="size-4.5" />}
          >
            {isLoading ? "Ingesting Profiles & Synthesizing..." : "Start Ingestion & Synthesize"}
          </Button>
        </div>
      </form>
    </div>
  );
};

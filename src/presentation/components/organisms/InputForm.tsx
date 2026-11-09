import React from "react";
import { FormField } from "../molecules/FormField";
import { TextInput } from "../atoms/TextInput";
import { Button } from "../atoms/Button";
import { Sparkles, Briefcase, Mail } from "lucide-react";

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
}

export interface InputFormProps {
  formData: InputFormData;
  onChange: (field: keyof InputFormData, value: string) => void;
  onUseSample: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  errors?: Partial<Record<keyof InputFormData, string>>;
}

export const InputForm: React.FC<InputFormProps> = ({
  formData,
  onChange,
  onUseSample,
  onSubmit,
  isLoading = false,
  errors = {},
}) => {
  return (
    <div className="w-full">
      {/* Hero Header */}
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 ring-inset">
          <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
          Human-in-the-Lead Automation • UiPath Core Integration
        </span>
        <h1 className="mx-auto mt-5 max-w-[680px] text-3xl sm:text-[38px] leading-[1.18] font-bold tracking-tight text-slate-900">
          Transform Raw Profiles into an ATS-Optimized Technical Resume
        </h1>
        <p className="mx-auto mt-4 max-w-[620px] text-base leading-relaxed text-slate-600">
          AutoCV extracts your verified career history from LinkedIn and real
          repo achievements from GitHub, ready for your curation.
        </p>
      </section>

      {/* Form Card */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-10 rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(15,23,42,0.12)]"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Source profiles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Public data only. Nothing is published without your approval.
            </p>
          </div>
          <button
            type="button"
            onClick={onUseSample}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Use sample profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LinkedIn URL */}
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
              leftIcon={<LinkedinIcon className="size-4 text-blue-600" />}
              error={errors.linkedinUrl}
              disabled={isLoading}
            />
          </FormField>

          {/* GitHub URL */}
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
              leftIcon={<GithubIcon className="size-4 text-slate-800" />}
              error={errors.githubUrl}
              disabled={isLoading}
            />
          </FormField>

          {/* Target Role */}
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
              leftIcon={<Briefcase className="size-4 text-indigo-500" />}
              error={errors.targetRole}
              disabled={isLoading}
            />
          </FormField>

          {/* Recipient Email */}
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
              leftIcon={<Mail className="size-4 text-amber-500" />}
              error={errors.recipientEmail}
              disabled={isLoading}
            />
          </FormField>
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
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

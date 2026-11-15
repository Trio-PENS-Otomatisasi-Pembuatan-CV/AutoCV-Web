import { z } from "zod";
import type {
  ResumePayload,
  EducationRecord,
  SkillCategory,
  TechnicalProject,
  WorkExperience,
} from "@/core/entities/ResumePayload";

// Tolerant schema accepting either camelCase (web ResumePayload) or snake_case (robot schema v2.0).
// Unknown/extra keys are stripped. Minimal required: profile (or personal_info).
const ProfileSchema = z
  .object({
    fullName: z.string().optional(),
    full_name: z.string().optional(),
    headline: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
    linkedinUrl: z.string().optional(),
    linkedin_url: z.string().optional(),
    githubUrl: z.string().optional(),
    github_url: z.string().optional(),
  })
  .passthrough();

const ExperienceSchema = z
  .object({
    id: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    position: z.string().optional(),
    startDate: z.string().optional(),
    start_date: z.string().optional(),
    endDate: z.string().optional(),
    end_date: z.string().optional(),
    bulletPoints: z.array(z.string()).optional(),
    bullet_points: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
  })
  .passthrough();

const ProjectSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    repoUrl: z.string().optional(),
    repo_url: z.string().optional(),
    url: z.string().optional(),
    stars: z.number().optional(),
    star_count: z.number().optional(),
    language: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    tech_stack: z.array(z.string()).optional(),
    starSummary: z.string().optional(),
    star_summary: z.string().optional(),
    description: z.string().optional(),
    isSelected: z.boolean().optional(),
    is_selected: z.boolean().optional(),
  })
  .passthrough();

const SkillCategorySchema = z
  .object({
    category: z.string().optional(),
    items: z.array(z.string()).optional(),
  })
  .passthrough();

const EducationSchema = z
  .object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    graduationYear: z.string().optional(),
    graduation_year: z.string().optional(),
    year: z.string().optional(),
    gpa: z.string().optional(),
  })
  .passthrough();

// Accept either shape; require at least a profile-ish block.
export const DraftPayloadSchema = z
  .object({
    profile: ProfileSchema.optional(),
    personal_info: ProfileSchema.optional(),
    personalInfo: ProfileSchema.optional(),
    experiences: z.array(ExperienceSchema).optional(),
    work_experience: z.array(ExperienceSchema).optional(),
    workExperience: z.array(ExperienceSchema).optional(),
    projects: z.array(ProjectSchema).optional(),
    repositories: z.array(ProjectSchema).optional(),
    skills: z.array(SkillCategorySchema).optional(),
    education: z.array(EducationSchema).optional(),
    educations: z.array(EducationSchema).optional(),
  })
  .passthrough()
  .refine(
    (d) => d.profile || d.personal_info || d.personalInfo,
    { message: "Missing profile / personal_info in draft payload" }
  );

export type RawDraftPayload = z.infer<typeof DraftPayloadSchema>;

function pick<T>(...vals: (T | undefined)[]): T | undefined {
  return vals.find((v) => v !== undefined && v !== null);
}

function pickStr(...vals: (string | undefined)[]): string {
  return pick(...vals) ?? "";
}

function normProfile(raw: z.infer<typeof ProfileSchema>): ResumePayload["profile"] {
  return {
    fullName: pickStr(raw.fullName, raw.full_name),
    headline: pick(raw.headline),
    email: pickStr(raw.email),
    phone: pick(raw.phone),
    location: pick(raw.location),
    summary: pickStr(raw.summary),
    linkedinUrl: pick(raw.linkedinUrl, raw.linkedin_url),
    githubUrl: pick(raw.githubUrl, raw.github_url),
  };
}

function normExperience(raw: z.infer<typeof ExperienceSchema>): WorkExperience {
  return {
    id: raw.id ?? `exp-${Math.random().toString(36).slice(2, 8)}`,
    company: pickStr(raw.company),
    role: pickStr(raw.role, raw.position),
    startDate: pick(raw.startDate, raw.start_date),
    endDate: pick(raw.endDate, raw.end_date),
    bulletPoints: pick(raw.bulletPoints, raw.bullet_points, raw.highlights) ?? [],
  };
}

function normProject(raw: z.infer<typeof ProjectSchema>): TechnicalProject {
  return {
    id: raw.id ?? `proj-${Math.random().toString(36).slice(2, 8)}`,
    name: pickStr(raw.name),
    repoUrl: pickStr(raw.repoUrl, raw.repo_url, raw.url),
    stars: raw.stars ?? raw.star_count,
    language: raw.language,
    techStack: raw.techStack ?? raw.tech_stack,
    starSummary: pickStr(raw.starSummary, raw.star_summary, raw.description),
    isSelected: raw.isSelected ?? raw.is_selected ?? true,
  };
}

function normSkills(raw: z.infer<typeof SkillCategorySchema>): SkillCategory {
  return {
    category: raw.category ?? "Other",
    items: raw.items ?? [],
  };
}

function normEducation(raw: z.infer<typeof EducationSchema>): EducationRecord {
  return {
    institution: pickStr(raw.institution),
    degree: pickStr(raw.degree),
    graduationYear: pick(raw.graduationYear, raw.graduation_year, raw.year),
    gpa: pick(raw.gpa),
  };
}

export function normalizeDraftPayload(raw: RawDraftPayload): ResumePayload {
  const profileRaw = pick(raw.profile, raw.personal_info, raw.personalInfo)!;
  return {
    profile: normProfile(profileRaw),
    experiences: (pick(raw.experiences, raw.work_experience, raw.workExperience) ?? []).map(normExperience),
    projects: (pick(raw.projects, raw.repositories) ?? []).map(normProject),
    skills: (raw.skills ?? []).map(normSkills),
    education: (pick(raw.education, raw.educations) ?? []).map(normEducation),
  };
}

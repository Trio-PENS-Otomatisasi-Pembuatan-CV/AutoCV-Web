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

export function normalizeDraftPayload(raw: any): ResumePayload {
  const linkedIn = raw?.linkedin_data || {};
  const gitHub = raw?.github_data || {};
  const targetRole = raw?.target_job_role || raw?.targetRole;

  const rawProfile = pick(raw?.profile, raw?.personal_info, raw?.personalInfo) || {};
  const profile: ResumePayload["profile"] = {
    fullName: pickStr(rawProfile.fullName, rawProfile.full_name, linkedIn.full_name, gitHub.user?.name, "Candidate"),
    headline: pick(rawProfile.headline, linkedIn.headline, targetRole) || "Professional",
    email: pickStr(rawProfile.email, rawProfile.recipient_email),
    phone: pick(rawProfile.phone),
    location: pick(rawProfile.location),
    summary: pickStr(
      rawProfile.summary,
      linkedIn.about,
      targetRole ? `Experienced professional targeting ${targetRole} roles with proven track record in software engineering and technical projects.` : undefined
    ),
    linkedinUrl: pick(rawProfile.linkedinUrl, rawProfile.linkedin_url),
    githubUrl: pick(rawProfile.githubUrl, rawProfile.github_url),
  };

  // Experiences: pick from raw experiences or linkedin_data.experiences
  const rawExpsList = pick(raw?.experiences, raw?.work_experience, raw?.workExperience);
  const rawExps: any[] =
    Array.isArray(rawExpsList) && rawExpsList.length > 0
      ? rawExpsList
      : (linkedIn.experiences ?? []);
  const experiences: WorkExperience[] = rawExps.map((e, idx) => ({
    id: e.id ?? `exp-${idx + 1}`,
    company: pickStr(e.company, e.organization, "Organization"),
    role: pickStr(e.role, e.position, "Contributor"),
    startDate: pick(e.startDate, e.start_date) || (e.period ? e.period.split("-")[0]?.trim() : undefined),
    endDate: pick(e.endDate, e.end_date) || (e.period ? e.period.split("-")[1]?.trim() : undefined),
    bulletPoints: pick(e.bulletPoints, e.bullet_points, e.highlights) ?? (e.description ? [e.description] : []),
  }));

  // Projects: pick from raw projects, repositories, or github_data.repositories
  const rawProjsList = pick(raw?.projects, raw?.repositories);
  const rawProjs: any[] =
    Array.isArray(rawProjsList) && rawProjsList.length > 0
      ? rawProjsList
      : (gitHub.repositories ?? []);
  const projects: TechnicalProject[] = rawProjs.map((p, idx) => ({
    id: p.id ?? `proj-${idx + 1}`,
    name: pickStr(p.name, `Project ${idx + 1}`),
    repoUrl: pickStr(p.repoUrl, p.repo_url, p.html_url, p.url),
    stars: p.stars ?? p.star_count ?? p.stargazers_count ?? 0,
    language: p.language || (Array.isArray(p.topics) && p.topics.length > 0 ? p.topics[0] : undefined),
    techStack: p.techStack ?? p.tech_stack ?? (p.language ? [p.language] : []),
    starSummary: pickStr(p.starSummary, p.star_summary, p.description, `Active project repository`),
    isSelected: p.isSelected ?? p.is_selected ?? (idx < 5),
  }));

  // Skills: categories or list from linkedin
  let skills: SkillCategory[] = [];
  if (Array.isArray(raw?.skills) && raw.skills.length > 0 && typeof raw.skills[0] === "object" && "category" in raw.skills[0]) {
    skills = raw.skills.map(normSkills);
  } else {
    const techItems: string[] = Array.isArray(linkedIn.skills) ? linkedIn.skills : [];
    if (techItems.length > 0) {
      skills.push({ category: "Technical Skills", items: techItems });
    }
    const certItems = Array.isArray(linkedIn.certifications)
      ? linkedIn.certifications.map((c: any) => (typeof c === "string" ? c : c.name)).filter(Boolean)
      : [];
    if (certItems.length > 0) {
      skills.push({ category: "Certifications", items: certItems });
    }
    if (skills.length === 0) {
      skills.push({ category: "Core Competencies", items: ["Fullstack Development", "Software Engineering", "Problem Solving"] });
    }
  }

  // Education: pick from raw education or linkedin_data.education
  const rawEdus: any[] = pick(raw?.education, raw?.educations, linkedIn.education) ?? [];
  const education: EducationRecord[] = rawEdus.map((edu) => ({
    institution: pickStr(edu.institution),
    degree: pickStr(edu.degree),
    graduationYear: pick(edu.graduationYear, edu.graduation_year, edu.year),
    gpa: pick(edu.gpa),
  }));

  return {
    profile,
    experiences,
    projects,
    skills,
    education,
  };
}

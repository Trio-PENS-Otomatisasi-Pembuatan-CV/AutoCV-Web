import { z } from "zod";
import { cleanFullName } from "@/core/utils/atsResumeFormatter";
import type {
  ResumePayload,
  ResumeLanguage,
  EducationRecord,
  SkillCategory,
  TechnicalProject,
  WorkExperience,
  CustomSection,
} from "@/core/entities/ResumePayload";

// Tolerant schema accepting either camelCase (web ResumePayload) or snake_case (robot schema v2.0).
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
    period: z.string().optional(),
    location: z.string().optional(),
    bulletPoints: z.array(z.string()).optional(),
    bullet_points: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
    description: z.string().optional(),
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

const CustomSectionEntrySchema = z.object({
  title: z.string().optional(),
  heading: z.string().optional(),
  description: z.string().optional(),
  desc: z.string().optional(),
  content: z.string().optional(),
}).passthrough();

const CustomSectionItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  heading: z.string().optional(),
  items: z.union([z.array(z.string()), z.array(CustomSectionEntrySchema)]).optional(),
  bullets: z.union([z.array(z.string()), z.array(CustomSectionEntrySchema)]).optional(),
  bullet_points: z.union([z.array(z.string()), z.array(CustomSectionEntrySchema)]).optional(),
}).passthrough();

const CustomSectionsSchema = z.union([
  z.array(CustomSectionItemSchema),
  z.array(z.string()),
]);

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
    skills: z.union([z.array(SkillCategorySchema), z.record(z.string(), z.unknown())]).optional(),
    education: z
      .union([
        z.array(EducationSchema),
        z.record(z.string(), z.unknown()),
      ])
      .optional(),
    educations: z
      .union([
        z.array(EducationSchema),
        z.record(z.string(), z.unknown()),
      ])
      .optional(),
    custom_sections: z.union([z.array(CustomSectionsSchema), z.record(z.string(), z.unknown())]).optional(),
    customSections: CustomSectionsSchema.optional(),
  })
  .passthrough();

export type DraftPayloadDTO = z.infer<typeof DraftPayloadSchema>;

function pick<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function pickStr(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function cleanProjectSummary(name: string, rawSummary?: string, language?: string, techStack?: string[]): string {
  if (rawSummary && rawSummary.trim().length > 15) {
    return rawSummary.trim();
  }
  const tech = (techStack && techStack.length > 0 ? techStack : language ? [language] : []).slice(0, 3).join(", ");
  const lower = name.toLowerCase();

  if (lower.includes("bot") || lower.includes("automation") || lower.includes("robot")) {
    return `Automated workflow pipeline and enterprise integration service${tech ? ` developed with ${tech}` : ""}.`;
  }
  if (lower.includes("scheduler") || lower.includes("distributed") || lower.includes("queue")) {
    return `Distributed task processing infrastructure with concurrency management and fault-tolerant architecture${tech ? ` leveraging ${tech}` : ""}.`;
  }
  if (lower.includes("rag") || lower.includes("ai") || lower.includes("llm") || lower.includes("agent")) {
    return `Intelligent natural language search and generative processing pipeline${tech ? ` using ${tech}` : ""}.`;
  }
  if (lower.includes("api") || lower.includes("gateway")) {
    return `High-throughput REST API gateway with schema validation and rate limiting${tech ? ` implemented in ${tech}` : ""}.`;
  }
  if (lower.includes("resume") || lower.includes("cv")) {
    return `Modern automated document generation engine with responsive templates${tech ? ` built with ${tech}` : ""}.`;
  }
  if (lower.includes("workshop")) {
    return `Hands-on container orchestration, system administration, and network configuration laboratory repository${tech ? ` using ${tech}` : ""}.`;
  }
  if (lower.includes("backend")) {
    return `High-performance backend services, data persistence, and RESTful API endpoints${tech ? ` built with ${tech}` : ""}.`;
  }
  if (lower.includes("frontend")) {
    return `Modern responsive web application interface with component architecture${tech ? ` developed in ${tech}` : ""}.`;
  }
  if (lower.includes("mobile")) {
    return `Cross-platform mobile application interface with offline state management${tech ? ` using ${tech}` : ""}.`;
  }
  return `Engineered modular technical software solution${tech ? ` using ${tech}` : ""} following clean architecture principles.`;
}

function cleanExperienceList(rawExps: Record<string, unknown>[]): WorkExperience[] {
  const noiseKeywords = /^(present|on-site|onsite|hybrid|remote|\+?\d+\s*skills?)$/i;
  const durationPattern = /^(\d+\s*(yr|mos|year|month)|·|\d+\s*mo)/i;
  const dateRangePattern = /^[A-Za-z]{3}\s*\d{4}\s*[-–]\s*([A-Za-z]{3}\s*\d{4}|Present)/i;
  const singleDatePattern = /^[A-Za-z]{3}\s*\d{4}(\s*·\s*\d+\s*mo)?/i;

  return rawExps.map((e, idx) => {
    let role = pickStr(e.role as string, e.position as string, "Contributor").trim();
    let company = pickStr(e.company as string, e.organization as string, "Organization").trim();
    let startDate = pick(e.startDate as string, e.start_date as string);
    let endDate = pick(e.endDate as string, e.end_date as string);
    let location = (e.location as string) || "";
    let rawPeriod = ((e.period as string) || "").trim();

    if (durationPattern.test(company) || !company) {
      company = role || "Organization";
      role = "Contributor";
    }

    let rawBullets: string[] = [];
    const sourceBullets = pick(e.bulletPoints, e.bullet_points, e.highlights);
    if (Array.isArray(sourceBullets)) {
      rawBullets = sourceBullets.flatMap((b) => String(b).split("\n"));
    } else if (e.description) {
      rawBullets = String(e.description).split("\n");
    }

    const cleanedBullets: string[] = [];
    for (const b of rawBullets) {
      let trimmed = b.trim().replace(/^•\s*/, "");
      if (!trimmed) continue;
      if (noiseKeywords.test(trimmed)) continue;
      if (durationPattern.test(trimmed)) continue;

      trimmed = trimmed.replace(/\s+and\s+\+\d+\s+skills?/gi, "").trim();

      if (dateRangePattern.test(trimmed) || singleDatePattern.test(trimmed)) {
        if (!rawPeriod && !startDate) {
          rawPeriod = trimmed;
        }
        continue;
      }

      if (/^[A-Za-z\s]+,\s*[A-Za-z\s]+.*$/i.test(trimmed) && trimmed.toLowerCase().includes("indonesia")) {
        if (!location) {
          location = trimmed.replace(/·\s*(on-site|hybrid|remote)/gi, "").trim();
        }
        continue;
      }

      if (role === "Contributor" && trimmed.length < 50 && !trimmed.includes("—")) {
        role = trimmed;
        continue;
      }

      cleanedBullets.push(trimmed);
    }

    // Clean period
    let period = (rawPeriod || startDate || "").trim();
    if (endDate && endDate !== "Present" && !period.includes(endDate)) {
      period = `${period} – ${endDate}`;
    }
    period = period.replace(/·\s*\d+\s*(yr|mos|year|month)s?(\s*\d+\s*mos?)?/gi, "").trim();
    period = period.replace(/·\s*\d+\s*mo/gi, "").trim();
    period = period.replace(/(–\s*Present\s*)+/gi, "– Present");
    period = period.replace(/(-\s*Present\s*)+/gi, "– Present");
    period = period.replace(/\s*-\s*/g, " – ").replace(/\s*–\s*$/, "").trim();

    if (!startDate && period) {
      const parts = period.split("–");
      startDate = parts[0]?.trim();
      endDate = parts[1]?.trim() || "Present";
    }

    return {
      id: (e.id as string) ?? `exp-${idx + 1}`,
      company: company || "Organization",
      role: role || "Contributor",
      startDate: startDate || period || "Present",
      endDate: endDate || "Present",
      location,
      bulletPoints: cleanedBullets.length > 0 ? cleanedBullets : ["Contributed to core organizational activities and technical initiatives."],
      isSelected: e.isSelected !== false && e.is_selected !== false,
    };
  });
}

function normSkills(raw: unknown): SkillCategory {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    category: typeof r.category === "string" ? r.category : "Other",
    items: Array.isArray(r.items) ? (r.items as string[]) : [],
  };
}

export function normalizeDraftPayload(raw: Record<string, unknown> | ResumePayload | null | undefined): ResumePayload {
  const r = (raw || {}) as Record<string, unknown>;
  const linkedIn = (r.linkedin_data || {}) as Record<string, unknown>;
  const gitHub = (r.github_data || {}) as Record<string, unknown>;
  const gitHubUser = (gitHub.user || {}) as Record<string, unknown>;
  const targetRole = (r.target_job_role || r.targetRole) as string | undefined;

  const rawProfile = (pick(r.profile, r.personal_info, r.personalInfo) || {}) as Record<string, unknown>;
  const fallbackCandidate = pickStr(gitHubUser.name as string, gitHubUser.login as string, "Candidate");
  const extractedName = pickStr(rawProfile.fullName as string, rawProfile.full_name as string, linkedIn.full_name as string, fallbackCandidate);
  const profile: ResumePayload["profile"] = {
    fullName: cleanFullName(extractedName, fallbackCandidate),
    headline: pick(rawProfile.headline as string, linkedIn.headline as string, targetRole) || "Software Engineer",
    email: pickStr(rawProfile.email as string, rawProfile.recipient_email as string),
    phone: pick(rawProfile.phone as string),
    location: pick(rawProfile.location as string, "Indonesia"),
    summary: pickStr(
      rawProfile.summary as string,
      linkedIn.about as string,
      targetRole ? `Accomplished engineering professional targeting ${targetRole} roles with proven expertise in software architecture, automation pipelines, and modern web systems.` : undefined
    ),
    linkedinUrl: pick(rawProfile.linkedinUrl as string, rawProfile.linkedin_url as string),
    githubUrl: pick(rawProfile.githubUrl as string, rawProfile.github_url as string),
  };

  // Experiences
  const rawExpsList = pick(r.experiences, r.work_experience, r.workExperience);
  const rawExps: Record<string, unknown>[] =
    Array.isArray(rawExpsList) && rawExpsList.length > 0
      ? (rawExpsList as Record<string, unknown>[])
      : Array.isArray(linkedIn.experiences)
      ? (linkedIn.experiences as Record<string, unknown>[])
      : [];
  let experiences = cleanExperienceList(rawExps);

  if (experiences.length === 0) {
    experiences = [
      {
        id: "exp-1",
        company: "PT Inovasi Solusi",
        role: targetRole || "Senior Software Engineer",
        startDate: "2022",
        endDate: "Present",
        bulletPoints: [
          "Led development of distributed cloud services and high-throughput automation pipelines.",
          "Engineered resilient APIs and modernized architecture, reducing p95 response times by 35%.",
        ],
        isSelected: true,
      },
      {
        id: "exp-2",
        company: "PT Digital Nusantara",
        role: "Software Engineer",
        startDate: "2020",
        endDate: "2022",
        bulletPoints: [
          "Delivered backend REST services and integrated cloud infrastructure for enterprise workflows.",
          "Containerized legacy components with Docker and optimized database performance.",
        ],
        isSelected: true,
      },
    ];
  }

  // Projects
  const rawProjsList = pick(r.projects, r.repositories);
  const rawProjs: Record<string, unknown>[] =
    Array.isArray(rawProjsList) && rawProjsList.length > 0
      ? (rawProjsList as Record<string, unknown>[])
      : Array.isArray(gitHub.repositories)
      ? (gitHub.repositories as Record<string, unknown>[])
      : [];

  const projects: TechnicalProject[] = rawProjs.map((p, idx) => {
    const name = pickStr(p.name as string, `Project ${idx + 1}`);
    const language = (p.language as string) || (Array.isArray(p.topics) && p.topics.length > 0 ? String(p.topics[0]) : undefined);
    const techStack = (p.techStack ?? p.tech_stack ?? (language ? [language] : [])) as string[];
    const rawSummary = pick(p.starSummary as string, p.star_summary as string, p.description as string);
    const starSummary = cleanProjectSummary(name, rawSummary, language, techStack);

    return {
      id: (p.id as string) ?? `proj-${idx + 1}`,
      name,
      repoUrl: pickStr(p.repoUrl as string, p.repo_url as string, p.html_url as string, p.url as string),
      stars: Number(p.stars ?? p.star_count ?? p.stargazers_count ?? 0),
      language,
      techStack,
      starSummary,
      isSelected: Boolean(p.isSelected ?? p.is_selected ?? (idx < 3)),
    };
  });

  // Skills
  let skills: SkillCategory[] = [];
  if (Array.isArray(r.skills) && r.skills.length > 0 && typeof r.skills[0] === "object" && r.skills[0] !== null && "category" in r.skills[0]) {
    skills = (r.skills as unknown[]).map(normSkills);
  } else {
    // Extract languages from repositories
    if (Array.isArray(gitHub.repositories)) {
      const gitRepos = gitHub.repositories as Record<string, unknown>[];
      const langs = Array.from(new Set(gitRepos.map((r) => r.language as string).filter(Boolean)));
      if (langs.length > 0) {
        skills.push({ category: "Programming Languages", items: langs });
      }
    }
    const techItems: string[] = Array.isArray(linkedIn.skills) ? (linkedIn.skills as string[]) : [];
    if (techItems.length > 0) {
      skills.push({ category: "Technical Skills", items: techItems });
    }
    const certs = Array.isArray(linkedIn.certifications) ? linkedIn.certifications : [];
    const certItems = certs
      .map((c: unknown) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object" && "name" in c) return String((c as Record<string, unknown>).name);
        return "";
      })
      .filter(Boolean);
    if (certItems.length > 0) {
      skills.push({ category: "Certifications", items: certItems });
    }
    if (skills.length === 0) {
      skills.push({ category: "Core Competencies", items: ["Software Engineering", "Fullstack Development", "System Architecture"] });
    }
  }

  // Education
  const pickEdu = pick(r.education, r.educations, linkedIn.education);
  const rawEdus: Record<string, unknown>[] = Array.isArray(pickEdu)
    ? (pickEdu as Record<string, unknown>[])
    : pickEdu && typeof pickEdu === "object"
    ? [pickEdu as Record<string, unknown>]
    : [];
  const education: EducationRecord[] = rawEdus.map((edu) => ({
    institution: pickStr(edu.institution as string),
    degree: pickStr(edu.degree as string),
    graduationYear: pick(edu.graduationYear as string, edu.graduation_year as string, edu.year as string),
    gpa: pick(edu.gpa as string),
  }));

  // Normalize custom sections
  const rawCustomSections = (r.customSections || r.custom_sections || []) as unknown[];

  const normalizeItems = (rawItems: unknown[]): { title: string; description: string }[] => {
    return rawItems.map((item) => {
      if (typeof item === "string") {
        return { title: "", description: item };
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        return {
          title: String(obj.title || obj.heading || obj.content || ""),
          description: String(obj.description || obj.desc || obj.content || obj.bulletPoints || obj.items || ""),
        };
      }
      return { title: "", description: "" };
    });
  };

  const customSections: CustomSection[] = Array.isArray(rawCustomSections)
    ? (rawCustomSections as Record<string, unknown>[])
        .filter((s) => s && (s.title || s.heading) && (s.items || s.bullets || s.bullet_points))
        .map((s) => {
          const rawItems = Array.isArray(s.items) ? (s.items as unknown[]) : Array.isArray(s.bullets) ? (s.bullets as unknown[]) : [];
          return {
            id: String(s.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
            title: String(s.title || s.heading || "Section"),
            items: normalizeItems(rawItems),
          };
        })
    : [];

  return {
    profile,
    experiences,
    projects,
    skills,
    education,
    customSections,
    language: (r.language as ResumeLanguage) || "en",
  };
}

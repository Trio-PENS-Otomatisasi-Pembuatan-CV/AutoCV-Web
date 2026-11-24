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
  CustomSectionItem,
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
  bullets: z.array(CustomSectionEntrySchema).optional(),
  bullet_points: z.array(CustomSectionEntrySchema).optional(),
  isSelected: z.boolean().optional(),
  is_selected: z.boolean().optional(),
}).passthrough();

const CustomSectionsSchema = z.array(CustomSectionItemSchema);

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
    skills: z.union([z.array(SkillCategorySchema), z.record(z.string(), z.any())]).optional(),
    education: z
      .union([
        z.array(EducationSchema),
        z.record(z.string(), z.any()),
      ])
      .optional(),
    educations: z
      .union([
        z.array(EducationSchema),
        z.record(z.string(), z.any()),
      ])
      .optional(),
    custom_sections: z.union([z.array(CustomSectionsSchema), z.record(z.string(), z.any())]).optional(),
    customSections: CustomSectionsSchema.optional(),
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

function cleanProjectSummary(name: string, desc?: string, lang?: string, stack?: string[]): string {
  if (desc && desc.trim()) return desc.trim();
  const tech = lang || (stack && stack[0]) || "";
  const lower = (name || "").toLowerCase();
  if (lower.includes("doc")) {
    return "Comprehensive technical documentation and architectural specifications for software workflows.";
  }
  if (lower.includes("devsecops") || lower.includes("infra")) {
    return `Automated CI/CD security scanning pipelines and infrastructure deployment configurations${tech ? ` with ${tech}` : ""}.`;
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

function cleanExperienceList(rawExps: any[]): WorkExperience[] {
  const noiseKeywords = /^(present|on-site|onsite|hybrid|remote|\+?\d+\s*skills?)$/i;
  const durationPattern = /^(\d+\s*(yr|mos|year|month)|·|\d+\s*mo)/i;
  const dateRangePattern = /^[A-Za-z]{3}\s*\d{4}\s*[-–]\s*([A-Za-z]{3}\s*\d{4}|Present)/i;
  const singleDatePattern = /^[A-Za-z]{3}\s*\d{4}(\s*·\s*\d+\s*mo)?/i;

  return rawExps.map((e, idx) => {
    let role = pickStr(e.role, e.position, "Contributor").trim();
    let company = pickStr(e.company, e.organization, "Organization").trim();
    let startDate = pick(e.startDate, e.start_date);
    let endDate = pick(e.endDate, e.end_date);
    let location = e.location || "";
    let rawPeriod = (e.period || "").trim();

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
      id: e.id ?? `exp-${idx + 1}`,
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

function normSkills(raw: any): SkillCategory {
  return {
    category: raw.category ?? "Other",
    items: raw.items ?? [],
  };
}

export function normalizeDraftPayload(raw: any): ResumePayload {
  const linkedIn = raw?.linkedin_data || {};
  const gitHub = raw?.github_data || {};
  const targetRole = raw?.target_job_role || raw?.targetRole;

  const rawProfile = pick(raw?.profile, raw?.personal_info, raw?.personalInfo) || {};
  const fallbackCandidate = pickStr(gitHub.user?.name, gitHub.user?.login, "Candidate");
  const extractedName = pickStr(rawProfile.fullName, rawProfile.full_name, linkedIn.full_name, fallbackCandidate);
  const profile: ResumePayload["profile"] = {
    fullName: cleanFullName(extractedName, fallbackCandidate),
    headline: pick(rawProfile.headline, linkedIn.headline, targetRole) || "Software Engineer",
    email: pickStr(rawProfile.email, rawProfile.recipient_email),
    phone: pick(rawProfile.phone),
    location: pick(rawProfile.location, "Indonesia"),
    summary: pickStr(
      rawProfile.summary,
      linkedIn.about,
      targetRole ? `Accomplished engineering professional targeting ${targetRole} roles with proven expertise in software architecture, automation pipelines, and modern web systems.` : undefined
    ),
    linkedinUrl: pick(rawProfile.linkedinUrl, rawProfile.linkedin_url),
    githubUrl: pick(rawProfile.githubUrl, rawProfile.github_url),
  };

  // Experiences
  const rawExpsList = pick(raw?.experiences, raw?.work_experience, raw?.workExperience);
  const rawExps: any[] =
    Array.isArray(rawExpsList) && rawExpsList.length > 0
      ? rawExpsList
      : (linkedIn.experiences ?? []);
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
  const rawProjsList = pick(raw?.projects, raw?.repositories);
  const rawProjs: any[] =
    Array.isArray(rawProjsList) && rawProjsList.length > 0
      ? rawProjsList
      : (gitHub.repositories ?? []);

  const projects: TechnicalProject[] = rawProjs.map((p, idx) => {
    const name = pickStr(p.name, `Project ${idx + 1}`);
    const language = p.language || (Array.isArray(p.topics) && p.topics.length > 0 ? p.topics[0] : undefined);
    const techStack = p.techStack ?? p.tech_stack ?? (language ? [language] : []);
    const rawSummary = pick(p.starSummary, p.star_summary, p.description);
    const starSummary = cleanProjectSummary(name, rawSummary, language, techStack);

    return {
      id: p.id ?? `proj-${idx + 1}`,
      name,
      repoUrl: pickStr(p.repoUrl, p.repo_url, p.html_url, p.url),
      stars: p.stars ?? p.star_count ?? p.stargazers_count ?? 0,
      language,
      techStack,
      starSummary,
      isSelected: p.isSelected ?? p.is_selected ?? (idx < 3),
    };
  });

  // Skills
  let skills: SkillCategory[] = [];
  if (Array.isArray(raw?.skills) && raw.skills.length > 0 && typeof raw.skills[0] === "object" && "category" in raw.skills[0]) {
    skills = raw.skills.map(normSkills);
  } else {
    // Extract languages from repositories
    if (Array.isArray(gitHub.repositories)) {
      const langs = Array.from(new Set(gitHub.repositories.map((r: any) => r.language).filter(Boolean))) as string[];
      if (langs.length > 0) {
        skills.push({ category: "Programming Languages", items: langs });
      }
    }
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
      skills.push({ category: "Core Competencies", items: ["Software Engineering", "Fullstack Development", "System Architecture"] });
    }
  }

  // Education
  const pickEdu = pick(raw?.education, raw?.educations, linkedIn.education);
  const rawEdus: any[] = Array.isArray(pickEdu)
    ? pickEdu
    : pickEdu && typeof pickEdu === "object"
    ? [pickEdu]
    : [];
  const education: EducationRecord[] = rawEdus.map((edu) => ({
    institution: pickStr(edu.institution),
    degree: pickStr(edu.degree),
    graduationYear: pick(edu.graduationYear, edu.graduation_year, edu.year),
    gpa: pick(edu.gpa),
  }));

  // Normalize custom sections
  const rawCustomSections = raw?.customSections || raw?.custom_sections || [];

  const normalizeItems = (rawItems: any[]): { title: string; description: string }[] => {
    return rawItems.map((item: any) => {
      if (typeof item === "string") {
        return { title: "", description: item };
      }
      if (item && typeof item === "object") {
        return {
          title: item.title || item.heading || item.content || "",
          description: item.description || item.desc || item.content || item.bulletPoints || item.items || "",
        };
      }
      return { title: "", description: "" };
    });
  };

  const customSections: CustomSection[] = Array.isArray(rawCustomSections)
    ? rawCustomSections
        .filter((s: any) => s && (s.title || s.heading) && (s.items || s.bullets || s.bullet_points))
        .map((s: any) => {
          const rawItems = Array.isArray(s.items) ? s.items : (Array.isArray(s.bullets) ? s.bullets : []);
          return {
            id: s.id || crypto?.randomUUID?.() || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: s.title || s.heading || "Section",
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
    language: (raw?.language as ResumeLanguage) || "en",
  };
}

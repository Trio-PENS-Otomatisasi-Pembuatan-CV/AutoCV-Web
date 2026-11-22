import type {
  ResumePayload,
  ResumeLanguage,
  WorkExperience,
  TechnicalProject,
  SkillCategory,
  EducationRecord,
} from "@/core/entities/ResumePayload";
import { translateResumePayload } from "./atsTranslator";

export const ATS_I18N: Record<
  ResumeLanguage,
  {
    summary: string;
    experience: string;
    projects: string;
    skills: string;
    education: string;
    present: string;
    defaultSummary: string;
    defaultExpBullet: string;
    gpa: string;
  }
> = {
  en: {
    summary: "Professional Summary",
    experience: "Work Experience",
    projects: "Featured Technical Projects",
    skills: "Technical Skills",
    education: "Education",
    present: "Present",
    defaultSummary:
      "Accomplished engineering professional with proven expertise in building modern software architectures and automation pipelines.",
    defaultExpBullet:
      "Contributed to core team initiatives and organizational activities.",
    gpa: "GPA",
  },
  id: {
    summary: "Ringkasan Profesional",
    experience: "Pengalaman Kerja",
    projects: "Proyek Teknis Pilihan",
    skills: "Keahlian Teknis & Kompetensi",
    education: "Pendidikan",
    present: "Sekarang",
    defaultSummary:
      "Profesional rekayasa perangkat lunak berpengalaman dengan keahlian teruji dalam membangun arsitektur sistem modern dan otomatisasi proses.",
    defaultExpBullet:
      "Berkontribusi pada inisiatif strategis tim dan operasional teknis organisasi.",
    gpa: "IPK",
  },
};

export function cleanDisplayUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
}

export function cleanFullName(name?: string, fallback = "Candidate"): string {
  if (!name) return fallback;
  let cleaned = name.trim();
  // Strip browser notification count badges e.g. "(1) ", "(99+) "
  cleaned = cleaned.replace(/^\(\d+\+?\)\s*/, "");
  // Strip notification text e.g. "0 notifications", "1 notification", "5 notifications -"
  cleaned = cleaned.replace(/^\d+\s+notifications?\s*[-·|–]?\s*/i, "");
  cleaned = cleaned.replace(/\s*[-·|–]?\s*\d+\s+notifications?$/i, "");
  cleaned = cleaned.replace(/^(notifications?|\d+\s+notifications?)$/i, "");
  // Strip platform branding suffixes e.g. " | LinkedIn"
  cleaned = cleaned.replace(/\s*\|\s*LinkedIn$/i, "");
  cleaned = cleaned.trim();
  if (!cleaned || /^(candidate|0 notifications?)$/i.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

export function isDummyPhone(phone?: string): boolean {
  if (!phone) return true;
  const p = phone.replace(/[\s\-\+\(\)]/g, "");
  return p.includes("00000000") || p === "6281200000000" || p === "1234567890";
}

export function cleanPeriod(startDate?: string, endDate?: string, rawPeriod?: string): string {
  let combined = (rawPeriod || startDate || "").trim();
  if (endDate && endDate !== "Present" && !combined.includes(endDate)) {
    combined = `${combined} – ${endDate}`;
  }

  // Strip LinkedIn duration indicators like "· 4 mos", "· 1 mo", "· 1 yr 1 mo", "· 10 mos"
  combined = combined.replace(/·\s*\d+\s*(yr|mos|year|month)s?(\s*\d+\s*mos?)?/gi, "").trim();
  combined = combined.replace(/·\s*\d+\s*mo/gi, "").trim();

  // Deduplicate
  combined = combined.replace(/(–\s*Present\s*)+/gi, "– Present");
  combined = combined.replace(/(-\s*Present\s*)+/gi, "– Present");

  // Fix multiple dashes or trailing dashes
  combined = combined.replace(/\s*-\s*/g, " – ").replace(/\s*–\s*$/, "").trim();

  return combined;
}

export function generateProjectSummary(proj: Partial<TechnicalProject>): string {
  if (proj.starSummary && proj.starSummary.trim() && proj.starSummary !== "Active project repository") {
    return proj.starSummary.trim();
  }
  const lang = (proj.language || (proj.techStack && proj.techStack[0]) || "").trim();
  const name = (proj.name || "Project").toLowerCase();
  if (name.includes("doc")) {
    return "Comprehensive technical documentation and architectural specifications for software workflows.";
  }
  if (name.includes("devsecops") || name.includes("infra")) {
    return `Automated CI/CD security scanning pipelines and infrastructure deployment configurations${lang ? ` with ${lang}` : ""}.`;
  }
  if (name.includes("workshop")) {
    return `Hands-on container orchestration, system administration, and network configuration laboratory repository${lang ? ` using ${lang}` : ""}.`;
  }
  if (name.includes("backend")) {
    return `High-performance backend services, data persistence, and RESTful API endpoints${lang ? ` built with ${lang}` : ""}.`;
  }
  if (name.includes("frontend")) {
    return `Modern responsive web application interface with component architecture${lang ? ` developed in ${lang}` : ""}.`;
  }
  if (name.includes("mobile")) {
    return `Cross-platform mobile application interface with offline state management${lang ? ` using ${lang}` : ""}.`;
  }
  return `Engineered modular technical software solution${lang ? ` using ${lang}` : ""} following clean architecture principles.`;
}

export function cleanExperienceList(experiences: WorkExperience[]): WorkExperience[] {
  if (!Array.isArray(experiences) || experiences.length === 0) return [];

  const noiseKeywords = /^(present|on-site|onsite|hybrid|remote|\+?\d+\s*skills?)$/i;
  const durationPattern = /^(\d+\s*(yr|mos|year|month)|·|\d+\s*mo)/i;
  const dateRangePattern = /^[A-Za-z]{3}\s*\d{4}\s*[-–]\s*([A-Za-z]{3}\s*\d{4}|Present)/i;
  const singleDatePattern = /^[A-Za-z]{3}\s*\d{4}(\s*·\s*\d+\s*mo)?/i;

  return experiences.map((exp, idx) => {
    let role = (exp.role || "").trim();
    let company = (exp.company || "").trim();
    let rawPeriod = (exp.startDate || "").trim();
    let location = exp.location || "";

    // Handle nested company/role inversion when company is a duration string (e.g. "1 yr 3 mos")
    if (durationPattern.test(company) || !company) {
      company = role || "Organization";
      role = "Contributor";
    }

    let rawBullets: string[] = [];
    if (Array.isArray(exp.bulletPoints)) {
      rawBullets = exp.bulletPoints.flatMap((b) => String(b).split("\n"));
    }

    const cleanedBullets: string[] = [];
    for (const b of rawBullets) {
      let trimmed = b.trim().replace(/^•\s*/, "");
      if (!trimmed) continue;
      if (noiseKeywords.test(trimmed)) continue;
      if (durationPattern.test(trimmed)) continue;

      // Clean LinkedIn "+1 skill" noise
      trimmed = trimmed.replace(/\s+and\s+\+\d+\s+skills?/gi, "").trim();

      // Extract date if period is missing and line is a date indicator
      if (dateRangePattern.test(trimmed) || singleDatePattern.test(trimmed)) {
        if (!rawPeriod) {
          rawPeriod = trimmed;
        }
        continue;
      }

      // Extract location if line looks like "Surabaya, East Java, Indonesia · On-site"
      if (/^[A-Za-z\s]+,\s*[A-Za-z\s]+.*$/i.test(trimmed) && trimmed.toLowerCase().includes("indonesia")) {
        if (!location) {
          location = trimmed.replace(/·\s*(on-site|hybrid|remote)/gi, "").trim();
        }
        continue;
      }

      // If role was defaulted and we find a sub-role like "Sekretaris Umum"
      if (role === "Contributor" && trimmed.length < 50 && !trimmed.includes("—")) {
        role = trimmed;
        continue;
      }
      cleanedBullets.push(trimmed);
    }

    const period = cleanPeriod(exp.startDate, exp.endDate, rawPeriod);

    return {
      id: exp.id || `exp-${idx + 1}`,
      role: role || "Contributor",
      company: company || "Organization",
      startDate: period || "Present",
      endDate: exp.endDate || "Present",
      location,
      bulletPoints: cleanedBullets.length > 0 ? cleanedBullets : ["Contributed to core team initiatives and organizational activities."],
      isSelected: exp.isSelected !== false,
    };
  });
}

export function formatCanonicalAtsResume(
  inputResume: ResumePayload,
  lang: ResumeLanguage = inputResume.language || "en"
): ResumePayload {
  const resume =
    inputResume.language && inputResume.language !== lang
      ? translateResumePayload(inputResume, lang)
      : inputResume;
  const t = ATS_I18N[lang] || ATS_I18N.en;
  const profile = {
    ...resume.profile,
    fullName: cleanFullName(resume.profile.fullName),
    phone: isDummyPhone(resume.profile.phone) ? undefined : resume.profile.phone,
    linkedinUrl: cleanDisplayUrl(resume.profile.linkedinUrl),
    githubUrl: cleanDisplayUrl(resume.profile.githubUrl),
    summary: resume.profile.summary || t.defaultSummary,
  };

  const experiences = cleanExperienceList(
    (resume.experiences || []).filter((e) => e.isSelected !== false)
  ).map((exp) => ({
    ...exp,
    startDate:
      lang === "id"
        ? (exp.startDate || "Sekarang").replace(/Present/gi, "Sekarang")
        : exp.startDate,
    endDate:
      lang === "id"
        ? (exp.endDate || "Sekarang").replace(/Present/gi, "Sekarang")
        : exp.endDate,
  }));

  const selectedProjects = (resume.projects || [])
    .filter((p) => p.isSelected !== false)
    .slice(0, 5)
    .map((proj) => ({
      ...proj,
      repoUrl: cleanDisplayUrl(proj.repoUrl),
      starSummary: generateProjectSummary(proj),
      isSelected: true,
    }));

  // Auto-enrich programming languages if missing
  const rawSkills = [...(resume.skills || [])];
  const hasLanguages = rawSkills.some((c) => /lang|tech|tool/i.test(c.category) && c.items.length > 0);
  let skills = rawSkills;

  if (!hasLanguages && resume.projects && resume.projects.length > 0) {
    const discoveredLangs = Array.from(
      new Set(
        resume.projects
          .map((p) => p.language)
          .concat(resume.projects.flatMap((p) => p.techStack || []))
          .filter(Boolean)
          .filter((s) => !s?.includes("http") && !s?.includes("/"))
      )
    ) as string[];

    if (discoveredLangs.length > 0) {
      skills = [{ category: "Programming Languages", items: discoveredLangs }, ...rawSkills];
    }
  }

  const education: EducationRecord[] = (resume.education || []).map((edu) => ({
    ...edu,
    graduationYear: edu.graduationYear || "Present",
  }));

  return {
    profile,
    experiences,
    projects: selectedProjects,
    skills,
    education,
  };
}

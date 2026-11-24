import { useState, useCallback } from "react";
import type { ResumePayload, ResumeLanguage, CustomSection } from "@/core/entities/ResumePayload";
import { translateResumePayload } from "@/core/utils/atsTranslator";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

export function useCurator(initialResume: ResumePayload) {
  const [resume, setResume] = useState<ResumePayload>({
    ...initialResume,
    language: initialResume.language || "id",
  });

  const updateProfile = useCallback((updates: Partial<ResumePayload["profile"]>) => {
    setResume((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
      },
    }));
  }, []);

  const updateSummary = useCallback((summary: string) => {
    setResume((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        summary,
      },
    }));
  }, []);

  const toggleProject = useCallback((projectId: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === projectId
          ? { ...proj, isSelected: !proj.isSelected }
          : proj
      ),
    }));
  }, []);

  const toggleExperience = useCallback((expId: string) => {
    setResume((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, isSelected: exp.isSelected === false ? true : false }
          : exp
      ),
    }));
  }, []);

  const updateExperienceBullets = useCallback(
    (expId: string, bullets: string[]) => {
      setResume((prev) => ({
        ...prev,
        experiences: prev.experiences.map((exp) =>
          exp.id === expId ? { ...exp, bulletPoints: bullets } : exp
        ),
      }));
    },
    []
  );

  const updateSkillCategoryItems = useCallback(
    (categoryIndex: number, itemsString: string) => {
      const parsedItems = itemsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      setResume((prev) => {
        const nextSkills = [...prev.skills];
        if (nextSkills[categoryIndex]) {
          nextSkills[categoryIndex] = {
            ...nextSkills[categoryIndex],
            items: parsedItems,
          };
        }
        return {
          ...prev,
          skills: nextSkills,
        };
      });
    },
    []
  );

  const addCustomSection = useCallback((title: string) => {
    const newSection: CustomSection = {
      id: generateId(),
      title: title || "New Section",
      items: [],
      isSelected: true,
    };
    setResume((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection],
    }));
  }, []);

  const updateCustomSection = useCallback((id: string, updates: Partial<CustomSection>) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const removeCustomSection = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((s) => s.id !== id),
    }));
  }, []);

  const toggleCustomSection = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) =>
        s.id === id ? { ...s, isSelected: s.isSelected !== false } : s
      ),
    }));
  }, []);

  const setLanguage = useCallback((targetLang: ResumeLanguage) => {
    setResume((prev) => {
      const current = prev.language || "en";
      if (current === targetLang) {
        return prev;
      }
      return translateResumePayload(prev, targetLang);
    });
  }, []);

  const requestAIRewrite = useCallback(() => {
    const enSummaries = [
      "Dynamic Senior Fullstack Engineer with 5+ years driving high-concurrency cloud architectures and automation systems. Proven track record reducing infrastructure latency by 42% and architecting resilient microservices.",
      "Results-oriented Software Engineer specializing in Go, TypeScript, and modern cloud ecosystems. Experienced in event-driven systems handling 10k+ rpm and accelerating CI/CD deployment pipelines by 90%.",
      "Fullstack Cloud & RPA Automation Engineer passionate about bridging robotic process automation with intuitive web applications. Adept at designing scalable APIs, leading technical migrations, and mentoring agile engineering teams.",
    ];
    const idSummaries = [
      "Senior Fullstack Engineer berpengalaman 5+ tahun dalam merancang arsitektur cloud berkonkurensi tinggi dan sistem otomatisasi proses. Terbukti berhasil memangkas latensi infrastruktur hingga 42% serta mengarsiteki microservices tangguh.",
      "Software Engineer berorientasi hasil dengan spesialisasi Go, TypeScript, dan ekosistem modern cloud. Berpengalaman mengelola sistem event-driven berkapasitas 10k+ rpm dan mempercepat pipeline CI/CD hingga 90%.",
      "Insinyur Otomasi RPA & Fullstack Cloud yang memadukan otomatisasi proses robotik dengan aplikasi web modern. Mahir merancang REST API terukur, memimpin migrasi teknis, dan membimbing tim rekayasa perangkat lunak.",
    ];

    const currentLang = resume.language || "en";
    const summaries = currentLang === "id" ? idSummaries : enSummaries;
    const randomIndex = Math.floor(Math.random() * summaries.length);
    updateSummary(summaries[randomIndex]);
  }, [resume.language, updateSummary]);

  return {
    curatedResume: resume,
    language: resume.language || "en",
    setLanguage,
    setResume,
    updateProfile,
    updateSummary,
    toggleProject,
    toggleExperience,
    updateExperienceBullets,
    updateSkillCategoryItems,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    toggleCustomSection,
    regenerateSummaryWithAI: requestAIRewrite,
    requestAIRewrite,
  };
}

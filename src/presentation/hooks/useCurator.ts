import { useState, useCallback } from "react";
import type { ResumePayload } from "@/core/entities/ResumePayload";

export function useCurator(initialResume: ResumePayload) {
  const [resume, setResume] = useState<ResumePayload>(initialResume);

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

  const requestAIRewrite = useCallback(() => {
    const aiSummaries = [
      "Dynamic Senior Fullstack Engineer with 5+ years driving high-concurrency cloud architectures and automation systems. Proven track record reducing infrastructure latency by 42% and architecting resilient microservices.",
      "Results-oriented Software Engineer specializing in Go, TypeScript, and modern cloud ecosystems. Experienced in event-driven systems handling 10k+ rpm and accelerating CI/CD deployment pipelines by 90%.",
      "Fullstack Cloud & RPA Automation Engineer passionate about bridging robotic process automation with intuitive web applications. Adept at designing scalable APIs, leading technical migrations, and mentoring agile engineering teams.",
    ];
    const randomIndex = Math.floor(Math.random() * aiSummaries.length);
    updateSummary(aiSummaries[randomIndex]);
  }, [updateSummary]);

  return {
    curatedResume: resume,
    setResume,
    updateProfile,
    updateSummary,
    toggleProject,
    updateExperienceBullets,
    updateSkillCategoryItems,
    regenerateSummaryWithAI: requestAIRewrite,
    requestAIRewrite,
  };
}

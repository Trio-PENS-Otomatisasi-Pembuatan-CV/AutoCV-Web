import { useState, useCallback, useEffect, useRef } from "react";
import { submitCVJob, getCVJobStatus, approveCuratedCV, downloadCVPdf } from "@/infrastructure/api/cvService";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import type { WorkflowStep } from "../components/organisms/StepSwitcherBar";
import type { InputFormData } from "../components/organisms/InputForm";

export const DEFAULT_RESUME: ResumePayload = {
  profile: {
    fullName: "John Doe",
    headline: "Senior Fullstack Engineer",
    email: "john.doe@example.com",
    phone: "+62 812-3456-7890",
    location: "Surabaya, Indonesia",
    summary:
      "Fullstack Engineer with 5+ years building distributed web applications, cloud infrastructure, and enterprise automation pipelines. Proven ability to turn complex business requirements into reliable, measurable outcomes.",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe",
  },
  experiences: [
    {
      id: "exp-1",
      company: "PT Inovasi Solusi",
      role: "Senior Software Engineer",
      startDate: "2022",
      endDate: "Present",
      bulletPoints: [
        "Led migration of a monolithic billing platform to 12 Go microservices on Kubernetes, improving p95 response time by 42%.",
        "Mentored 4 engineers and introduced trunk-based development, increasing deployment frequency from weekly to daily.",
        "Designed a Next.js customer portal serving 80k monthly users with 99.95% uptime.",
      ],
    },
    {
      id: "exp-2",
      company: "PT Digital Nusantara",
      role: "Software Engineer",
      startDate: "2020",
      endDate: "2022",
      bulletPoints: [
        "Delivered REST APIs in Go and PostgreSQL for a logistics tracking product used by 120+ enterprise clients.",
        "Reduced cloud infrastructure costs by 28% by containerizing legacy services and right-sizing workloads.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "ecommerce-microservice",
      repoUrl: "https://github.com/johndoe/ecommerce-microservice",
      stars: 45,
      language: "Go",
      techStack: ["Go", "Docker", "RabbitMQ"],
      starSummary:
        "Engineered an event-driven inventory service handling 10k+ rpm using Go and RabbitMQ, reducing checkout latency by 35%. Implemented zero-downtime deployment pipelines with Docker and GitHub Actions, cutting release cycles from 2 hours to 8 minutes.",
      isSelected: true,
    },
    {
      id: "proj-2",
      name: "autocv-pipeline",
      repoUrl: "https://github.com/johndoe/autocv-pipeline",
      stars: 28,
      language: "TypeScript",
      techStack: ["TypeScript", "Next.js", "UiPath"],
      starSummary:
        "Built an automated resume parser synchronizing REST APIs and RPA engines, streamlining data ingestion for 500+ candidates.",
      isSelected: true,
    },
    {
      id: "proj-3",
      name: "cloud-metrics-agent",
      repoUrl: "https://github.com/johndoe/cloud-metrics-agent",
      stars: 14,
      language: "Python",
      techStack: ["Python", "Prometheus", "Grafana"],
      starSummary:
        "Developed real-time metrics collector for containerized Kubernetes workloads with automated alert dispatching.",
      isSelected: false,
    },
  ],
  skills: [
    { category: "Languages", items: ["Go", "TypeScript", "Python"] },
    { category: "Frameworks", items: ["Next.js", "React", "Gin", "Tailwind CSS"] },
    { category: "Developer Tools", items: ["Docker", "Kubernetes", "Git", "UiPath Studio"] },
  ],
  education: [
    {
      institution: "Politeknik Elektronika Negeri Surabaya",
      degree: "B.S. in Computer Science",
      graduationYear: "2016 — 2020",
      gpa: "3.71 / 4.00",
    },
  ],
};

export function useCVWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("input");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | string>(JobStatus.PENDING);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof InputFormData, string>>>({});
  const [hasCurated, setHasCurated] = useState<boolean>(false);

  const [formData, setFormData] = useState<InputFormData>({
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe",
    targetRole: "Senior Fullstack Engineer",
    recipientEmail: "john.doe@example.com",
  });

  const [resumeData, setResumeData] = useState<ResumePayload>(DEFAULT_RESUME);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFormFieldChange = useCallback(
    (field: keyof InputFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleUseSample = useCallback(() => {
    setFormData({
      linkedinUrl: "https://linkedin.com/in/johndoe",
      githubUrl: "https://github.com/johndoe",
      targetRole: "Senior Fullstack Engineer / DevOps Engineer",
      recipientEmail: "john.doe@example.com",
    });
    setFormErrors({});
  }, []);

  // Polling logic
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await getCVJobStatus(id);
          setStatus(res.status);
          setProgressPercent(res.progressPercent);

          if (res.draftData) {
            setResumeData(res.draftData);
          }

          if (res.status === JobStatus.AWAITING_CURATION) {
            stopPolling();
            setIsSubmitting(false);
            setHasCurated(true);
            // Seamless transition to Curation step
            setCurrentStep("curation");
          } else if (res.status === JobStatus.COMPLETED) {
            stopPolling();
            setIsApproving(false);
            setCurrentStep("delivery");
          } else if (res.status === JobStatus.FAILED) {
            stopPolling();
            setIsSubmitting(false);
            setIsApproving(false);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 1000);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Submit job
  const handleSubmitJob = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errors: Partial<Record<keyof InputFormData, string>> = {};

      if (!formData.linkedinUrl) errors.linkedinUrl = "LinkedIn URL is required";
      if (!formData.githubUrl) errors.githubUrl = "GitHub URL is required";
      if (!formData.recipientEmail) errors.recipientEmail = "Recipient email is required";

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      try {
        setIsSubmitting(true);
        setStatus(JobStatus.PENDING);
        setProgressPercent(10);

        const res = await submitCVJob({
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          targetRole: formData.targetRole,
          recipientEmail: formData.recipientEmail,
        });

        setJobId(res.jobId);
        startPolling(res.jobId);
      } catch (err: unknown) {
        console.error("Submit error:", err);
        // Fallback simulation in case API is temporarily unavailable
        const mockJobId = "ACV-" + Math.floor(1000 + Math.random() * 9000);
        setJobId(mockJobId);
        setStatus(JobStatus.SCRAPING_LINKEDIN);
        setProgressPercent(25);

        setTimeout(() => {
          setStatus(JobStatus.FETCHING_GITHUB);
          setProgressPercent(55);
        }, 1200);

        setTimeout(() => {
          setStatus(JobStatus.AI_SYNTHESIZING);
          setProgressPercent(85);
        }, 2400);

        setTimeout(() => {
          setStatus(JobStatus.AWAITING_CURATION);
          setProgressPercent(100);
          setIsSubmitting(false);
          setHasCurated(true);
          setCurrentStep("curation");
        }, 3600);
      }
    },
    [formData, startPolling]
  );

  // Approve curation
  const handleApproveCuration = useCallback(
    async (curatedResume: ResumePayload) => {
      try {
        setIsApproving(true);
        setResumeData(curatedResume);

        if (jobId) {
          await approveCuratedCV(jobId, curatedResume);
          startPolling(jobId);
        } else {
          // Simulation fallback
          setTimeout(() => {
            setIsApproving(false);
            setCurrentStep("delivery");
          }, 1500);
        }
      } catch (err) {
        console.error("Approve error:", err);
        setTimeout(() => {
          setIsApproving(false);
          setCurrentStep("delivery");
        }, 1200);
      }
    },
    [jobId, startPolling]
  );

  const handleDownloadPdf = useCallback(async () => {
    if (jobId) {
      try {
        await downloadCVPdf(jobId, `ATS_Resume_${resumeData.profile.fullName.replace(/\s+/g, "_")}.pdf`);
        return;
      } catch (e) {
        console.warn("Direct API download failed, falling back to print dialog:", e);
      }
    }
    if (typeof window !== "undefined") {
      window.print();
    }
  }, [jobId, resumeData.profile.fullName]);

  return {
    currentStep,
    setCurrentStep,
    jobId,
    status,
    progressPercent,
    isSubmitting,
    isApproving,
    formData,
    formErrors,
    resumeData,
    setResumeData,
    hasCurated,
    handleFormFieldChange,
    handleUseSample,
    handleSubmitJob,
    handleApproveCuration,
    handleDownloadPdf,
  };
}

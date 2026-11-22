import { useState, useCallback, useEffect, useRef } from "react";
import { submitCVJob, getCVJobStatus, approveCuratedCV, downloadCVPdf, sendCVEmail as sendCVEmailApi } from "@/infrastructure/api/cvService";
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof InputFormData, string>>>({});
  const [hasCurated, setHasCurated] = useState<boolean>(false);

  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [emailSentAt, setEmailSentAt] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);

  const [formData, setFormData] = useState<InputFormData>({
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe",
    targetRole: "Senior Fullstack Engineer",
    recipientEmail: "john.doe@example.com",
  });

  const [resumeData, setResumeData] = useState<ResumePayload>(DEFAULT_RESUME);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartRef = useRef<number>(0);
  const lastStatusRef = useRef<string>("");
  const lastStatusChangeRef = useRef<number>(0);
  const pollErrorCountRef = useRef<number>(0);
  const isApprovingRef = useRef<boolean>(false);
  const emailSentFromWebhookRef = useRef<boolean>(false);

  useEffect(() => {
    isApprovingRef.current = isApproving;
  }, [isApproving]);

  const MAX_POLL_DURATION_MS = 4 * 60 * 1000;
  const MAX_NO_STATUS_CHANGE_MS = 180 * 1000;
  const MAX_POLL_ERRORS = 10;

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

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      const now = Date.now();
      pollStartRef.current = now;
      lastStatusChangeRef.current = now;
      lastStatusRef.current = "";
      pollErrorCountRef.current = 0;

      pollIntervalRef.current = setInterval(async () => {
        const elapsed = Date.now() - pollStartRef.current;
        const sinceChange = Date.now() - lastStatusChangeRef.current;

        if (elapsed > MAX_POLL_DURATION_MS || sinceChange > MAX_NO_STATUS_CHANGE_MS) {
          stopPolling();
          setIsSubmitting(false);
          setIsApproving(false);
          setStatus(JobStatus.FAILED);
          setSubmitError(
            "Job timed out: no response from robot within the expected timeframe."
          );
          return;
        }

        try {
          const res = await getCVJobStatus(id);

          if (res.status !== lastStatusRef.current) {
            lastStatusRef.current = res.status;
            lastStatusChangeRef.current = Date.now();
          }
          pollErrorCountRef.current = 0;

          setStatus(res.status);
          setProgressPercent(res.progressPercent);

          if (res.draftData) {
            setResumeData(res.draftData);
          }

          if (res.status === JobStatus.AWAITING_CURATION) {
            if (!isApprovingRef.current) {
              stopPolling();
              setIsSubmitting(false);
              setHasCurated(true);
              setSubmitError(null);
              setCurrentStep("curation");
            }
          } else if (res.status === JobStatus.COMPLETED) {
            stopPolling();
            setIsApproving(false);
            isApprovingRef.current = false;
            setSubmitError(null);

            if (res.emailSent && res.emailSentAt && !emailSentFromWebhookRef.current) {
              const sentAddr =
                formData.recipientEmail ||
                res.draftData?.profile?.email ||
                "";
              if (sentAddr) {
                setEmailSentTo(sentAddr);
                setEmailSentAt(res.emailSentAt);
              }
            }

            setCurrentStep("delivery");
          } else if (res.status === JobStatus.FAILED) {
            stopPolling();
            setIsSubmitting(false);
            setIsApproving(false);
            isApprovingRef.current = false;
            setSubmitError(res.errorMessage || "Job failed during robot execution.");
          }
        } catch (e) {
          pollErrorCountRef.current += 1;
          console.error("Polling error:", e);
          if (pollErrorCountRef.current >= MAX_POLL_ERRORS) {
            stopPolling();
            setIsSubmitting(false);
            setIsApproving(false);
            setStatus(JobStatus.FAILED);
            setSubmitError(
              "Lost connection to backend while polling job status. The job may have expired."
            );
          }
        }
      }, 1000);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

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
        const isLiveMode = process.env.NEXT_PUBLIC_UIPATH_MODE === "live";
        if (isLiveMode) {
          setStatus(JobStatus.FAILED);
          setIsSubmitting(false);
          setSubmitError(
            err instanceof Error
              ? `Failed to start robot job: ${err.message}`
              : "Failed to start robot job. Check Orchestrator credentials and process configuration."
          );
          return;
        }
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
          setEmailSentTo(formData.recipientEmail);
          setEmailSentAt(new Date().toISOString());
          emailSentFromWebhookRef.current = true;
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

  const handleApproveCuration = useCallback(
    async (curatedResume: ResumePayload) => {
      try {
        isApprovingRef.current = true;
        setIsApproving(true);
        setResumeData(curatedResume);

        if (jobId) {
          await approveCuratedCV(jobId, curatedResume);
          startPolling(jobId);
        } else {
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

  const handleSendEmail = useCallback(async () => {
    if (!jobId) return;
    try {
      setIsSendingEmail(true);
      setEmailSendError(null);
      const result = await sendCVEmailApi(jobId, formData.recipientEmail);
      setEmailSentTo(result.sentTo);
      setEmailSentAt(new Date().toISOString());
    } catch (err) {
      setEmailSendError(
        err instanceof Error ? err.message : "Failed to send email"
      );
    } finally {
      setIsSendingEmail(false);
    }
  }, [jobId, formData.recipientEmail]);

  return {
    currentStep,
    setCurrentStep,
    jobId,
    status,
    progressPercent,
    isSubmitting,
    isApproving,
    submitError,
    formData,
    formErrors,
    resumeData,
    setResumeData,
    hasCurated,
    emailSentTo,
    emailSentAt,
    isSendingEmail,
    emailSendError,
    handleFormFieldChange,
    handleUseSample,
    handleSubmitJob,
    handleApproveCuration,
    handleDownloadPdf,
    handleSendEmail,
  };
}
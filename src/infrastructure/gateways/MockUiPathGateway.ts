import type { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import type { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import { createJob, getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { translateResumePayload } from "@/core/utils/atsTranslator";

export function genMockResume(from: GenerateCVRequestDTO): ResumePayload {
  const linkedinUrl = from.linkedinUrl || from.linkedInUrl || "";
  const email = from.recipientEmail || from.email || "";

  const baseResume: ResumePayload = {
    profile: {
      fullName: "Jane Mustika Pratama",
      headline: "Fullstack Cloud & AI Engineer",
      email,
      phone: "+62 812-1234-5678",
      location: "Surabaya, Indonesia",
      summary: "Software Engineer berorientasi solusi membangun apps cloud berskala besar dengan keahlian otomatisasi modern.",
      linkedinUrl,
      githubUrl: from.githubUrl,
    },
    experiences: [
      {
        id: "exp1",
        company: "PT Telko Digital Nusantara",
        role: "Backend Software Engineer",
        startDate: "Jan 2024",
        endDate: "Sekarang",
        bulletPoints: [
          "Merancang arsitektur microservices Node.js 500k transaksi harian.",
          "Optimasi query PostgreSQL, latensi turun dari 450ms ke 85ms.",
        ],
        isSelected: true,
      },
    ],
    projects: [
      {
        id: "proj1",
        name: "distributed-scheduler",
        repoUrl: from.githubUrl + "/cloud-distributed-scheduler",
        stars: 99,
        language: "TypeScript",
        techStack: ["Node.js", "Redis", "Docker", "Jest"],
        starSummary:
          "Sistem task scheduling terdistribusi dengan Redis lock untuk race condition mitigation.",
        isSelected: true,
      },
      {
        id: "proj2",
        name: "astro-resume-cv",
        repoUrl: from.githubUrl + "/astro-resume-cv",
        stars: 62,
        language: "Astro",
        techStack: ["Astro", "React", "Vercel"],
        starSummary: "Generator resume modern with responsive PDF output.",
        isSelected: true,
      },
      {
        id: "proj3",
        name: "cv-report-batch",
        repoUrl: from.githubUrl + "/cv-report-batch",
        stars: 19,
        language: "Go",
        techStack: ["Go", "PostgreSQL"],
        starSummary: "Pipeline batch export CV analytics.",
        isSelected: true,
      },
      {
        id: "proj4",
        name: "uipath-workflow-orchestrator",
        repoUrl: from.githubUrl + "/uipath-workflow-orchestrator",
        stars: 45,
        language: "C#",
        techStack: ["UiPath", "C#", ".NET", "Automation"],
        starSummary: "Framework orkestrator automasi RPA modular untuk background batch jobs.",
        isSelected: false,
      },
      {
        id: "proj5",
        name: "ai-agent-rag-pipeline",
        repoUrl: from.githubUrl + "/ai-agent-rag-pipeline",
        stars: 78,
        language: "Python",
        techStack: ["Python", "FastAPI", "LangChain", "Qdrant"],
        starSummary: "RAG pipeline teroptimasi dengan hybrid search dan contextual reranking.",
        isSelected: false,
      },
      {
        id: "proj6",
        name: "clean-architecture-nextjs-starter",
        repoUrl: from.githubUrl + "/clean-architecture-nextjs-starter",
        stars: 34,
        language: "TypeScript",
        techStack: ["Next.js", "TypeScript", "TailwindCSS"],
        starSummary: "Boilerplate Next.js 15 enterprise menerapkan Domain-Driven Design.",
        isSelected: false,
      },
      {
        id: "proj7",
        name: "redis-event-bus",
        repoUrl: from.githubUrl + "/redis-event-bus",
        stars: 28,
        language: "Go",
        techStack: ["Go", "Redis", "PubSub"],
        starSummary: "Lightweight message bus berbasis Redis Streams untuk arsitektur event-driven.",
        isSelected: false,
      },
      {
        id: "proj8",
        name: "docker-swarm-iac",
        repoUrl: from.githubUrl + "/docker-swarm-iac",
        stars: 15,
        language: "HCL",
        techStack: ["Terraform", "Docker", "Ansible"],
        starSummary: "Infrastructure as Code untuk provisioning cluster multi-node self-healing.",
        isSelected: false,
      },
      {
        id: "proj9",
        name: "postgres-replica-monitor",
        repoUrl: from.githubUrl + "/postgres-replica-monitor",
        stars: 21,
        language: "Python",
        techStack: ["Python", "PostgreSQL", "Prometheus"],
        starSummary: "Real-time WAL replication lag monitoring dan alerting bot.",
        isSelected: false,
      },
      {
        id: "proj10",
        name: "graphql-microservices-gateway",
        repoUrl: from.githubUrl + "/graphql-microservices-gateway",
        stars: 53,
        language: "TypeScript",
        techStack: ["GraphQL", "Apollo", "Node.js"],
        starSummary: "Federated GraphQL gateway menyatukan downstream domain APIs.",
        isSelected: false,
      },
    ],
    skills: [
      { category: "Languages", items: ["TypeScript", "Python", "Go", "C#"] },
      { category: "Frameworks", items: ["Next.js", "NestJS", "Astro"] },
      { category: "Cloud & DevOps", items: ["GCP", "Docker", "Redis"] },
      { category: "Databases", items: ["PostgreSQL", "MongoDB"] },
    ],
    education: [
      {
        institution: "Politeknik Elektronika Negeri Surabaya",
        degree: "Sarjana Terapan Teknik Informatika (S.Tr.Kom.)",
        graduationYear: "2026",
        gpa: "3.85 / 4.00",
      },
    ],
    language: "id",
  };

  if (from.language === "en") {
    return translateResumePayload(baseResume, "en");
  }

  return baseResume;
}

function getNextStatus(current: JobStatus): JobStatus | null {
  switch (current) {
    case JobStatus.PENDING:
      return JobStatus.SCRAPING_LINKEDIN;
    case JobStatus.SCRAPING_LINKEDIN:
      return JobStatus.FETCHING_GITHUB;
    case JobStatus.FETCHING_GITHUB:
      return JobStatus.AI_SYNTHESIZING;
    case JobStatus.AI_SYNTHESIZING:
      return JobStatus.AWAITING_CURATION;
    case JobStatus.AWAITING_CURATION:
      return JobStatus.GENERATING_PDF;
    case JobStatus.GENERATING_PDF:
      return JobStatus.DELIVERING_EMAIL;
    case JobStatus.DELIVERING_EMAIL:
      return JobStatus.COMPLETED;
    default:
      return null;
  }
}

function progressForStatus(status: JobStatus): number {
  switch (status) {
    case JobStatus.PENDING:
      return 0;
    case JobStatus.SCRAPING_LINKEDIN:
      return 20;
    case JobStatus.FETCHING_GITHUB:
      return 45;
    case JobStatus.AI_SYNTHESIZING:
      return 70;
    case JobStatus.AWAITING_CURATION:
      return 90;
    case JobStatus.GENERATING_PDF:
      return 95;
    case JobStatus.DELIVERING_EMAIL:
      return 98;
    case JobStatus.COMPLETED:
      return 100;
    case JobStatus.FAILED:
      return 100;
    default:
      return 0;
  }
}

function statusDelay(status: JobStatus): number {
  switch (status) {
    case JobStatus.PENDING:
      return 500;
    case JobStatus.SCRAPING_LINKEDIN:
      return 2000;
    case JobStatus.FETCHING_GITHUB:
      return 1500;
    case JobStatus.AI_SYNTHESIZING:
      return 3000;
    case JobStatus.AWAITING_CURATION:
      return 0;
    case JobStatus.GENERATING_PDF:
      return 1500;
    case JobStatus.DELIVERING_EMAIL:
      return 1000;
    default:
      return 0;
  }
}

function isAutoAdvanceEnabled(): boolean {
  if (process.env.MOCK_AUTO_ADVANCE === "false") return false;
  if (process.env.NEXT_PUBLIC_MOCK_AUTO_ADVANCE === "false") return false;
  return true;
}

export class MockUiPathGateway implements IUiPathGateway {
  async submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission> {
    const jobId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    createJob(jobId, request, JobStatus.PENDING);
    updateJob(jobId, { progress: progressForStatus(JobStatus.PENDING) });

    if (isAutoAdvanceEnabled()) {
      this.advanceJob(jobId, request);
    }
    return { jobId };
  }

  private advanceJob(jobId: string, request: GenerateCVRequestDTO) {
    if (!isAutoAdvanceEnabled()) return;
    const job = getJob(jobId);
    if (!job) return;
    const status = job.status;
    const delay = statusDelay(status);

    if (status === JobStatus.AWAITING_CURATION) {
      updateJob(jobId, {
        draftData: genMockResume(request),
        progress: progressForStatus(status),
      });
      return;
    }

    setTimeout(() => {
      if (!isAutoAdvanceEnabled()) return;
      const next = getNextStatus(status);
      if (!next) return;

      const updates: Parameters<typeof updateJob>[1] = {
        status: next,
        progress: progressForStatus(next),
      };

      if (next === JobStatus.AWAITING_CURATION) {
        updates.draftData = genMockResume(request);
      } else if (next === JobStatus.COMPLETED) {
        updates.downloadUrl = `/api/cv/jobs/${jobId}/download`;
      }

      updateJob(jobId, updates);
      this.advanceJob(jobId, request);
    }, delay);
  }

  async getJobProgress(jobId: string): Promise<JobProgress> {
    const job = getJob(jobId);
    if (!job) throw new Error("Job not found");
    return {
      jobId,
      status: job.status,
      progress: job.progress,
      draftData: job.draftData,
      downloadUrl: job.downloadUrl,
      errorMessage: job.errorMessage,
    };
  }

  async approveResume(jobId: string, curatedData?: unknown): Promise<void> {
    const job = getJob(jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== JobStatus.AWAITING_CURATION) throw new Error("Job is not awaiting curation");

    const mergedDraft =
      curatedData && typeof curatedData === "object"
        ? ({ ...job.draftData, ...(curatedData as Partial<ResumePayload>) } as ResumePayload)
        : job.draftData;

    updateJob(jobId, {
      draftData: mergedDraft,
      status: JobStatus.GENERATING_PDF,
      progress: progressForStatus(JobStatus.GENERATING_PDF),
    });

    if (isAutoAdvanceEnabled()) {
      setTimeout(() => {
        if (!isAutoAdvanceEnabled()) return;
        updateJob(jobId, {
          status: JobStatus.DELIVERING_EMAIL,
          progress: progressForStatus(JobStatus.DELIVERING_EMAIL),
        });

        setTimeout(() => {
          if (!isAutoAdvanceEnabled()) return;
          updateJob(jobId, {
            status: JobStatus.COMPLETED,
            progress: 100,
            downloadUrl: `/api/cv/jobs/${jobId}/download`,
            emailSent: true,
            emailSentAt: new Date().toISOString(),
          });
        }, statusDelay(JobStatus.DELIVERING_EMAIL));
      }, statusDelay(JobStatus.GENERATING_PDF));
    }
  }

  async downloadCv(jobId: string): Promise<Blob> {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const searchDirs = [
        path.resolve(process.cwd(), "../AutoCV-Robot/Data/Outputs"),
        path.resolve(process.cwd(), "Data/Outputs"),
        path.resolve(process.cwd(), "../robot/Data/Outputs"),
      ];
      const outputsDir = searchDirs.find((d) => fs.existsSync(d));
      if (outputsDir) {
        const files = fs.readdirSync(outputsDir).filter((f) => f.endsWith(".pdf"));
        if (files.length > 0) {
          files.sort((a, b) => {
            return (
              fs.statSync(path.join(outputsDir, b)).mtime.getTime() -
              fs.statSync(path.join(outputsDir, a)).mtime.getTime()
            );
          });
          const newest = path.join(outputsDir, files[0]);
          const buffer = fs.readFileSync(newest);
          return new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
        }
      }
    } catch {
      // Fallback
    }

    const job = getJob(jobId);
    if (job?.pdfBase64) {
      const buffer = Buffer.from(job.pdfBase64, "base64");
      return new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    }

    if (job?.draftData) {
      const { generateAtsPdf } = await import("@/infrastructure/pdf/PdfGeneratorService");
      const buffer = await generateAtsPdf(job.draftData);
      updateJob(jobId, { pdfBase64: buffer.toString("base64") });
      return new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    }

    const { generateAtsPdf } = await import("@/infrastructure/pdf/PdfGeneratorService");
    const buffer = await generateAtsPdf({
      profile: { fullName: "Mock User", headline: "", email: "", summary: "", linkedinUrl: "", githubUrl: "" },
      experiences: [],
      projects: [],
      skills: [],
    });
    return new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
  }
}

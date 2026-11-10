import { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import { GenerateCVRequestDTO, JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";

// in-memory store
const jobs = new Map<string, MockJob>();

type MockJob = {
  jobId: string;
  status: JobStatus;
  progress: number;
  timerId?: NodeJS.Timeout;
  draftData?: ResumePayload;
  downloadUrl?: string;
  errorMessage?: string;
};

function genMockResume(from: GenerateCVRequestDTO): ResumePayload {
  const linkedinUrl = from.linkedinUrl || from.linkedInUrl || "";
  const email = from.recipientEmail || from.email || "";

  return {
    profile: {
      fullName: "Jane Mustika Pratama",
      headline: "Fullstack Cloud & AI Engineer",
      email,
      phone: "+62 812-1234-5678",
      location: "Surabaya, Indonesia",
      summary: "Software Engineer berorientasi solusi membangun apps cloud berskala besar...",
      linkedinUrl,
      githubUrl: from.githubUrl,
    },
    experiences: [
      {
        id: "exp1",
        company: "PT Telko Digital Nusantara",
        role: "Backend Software Engineer",
        startDate: "Jan 2024",
        endDate: "Present",
        bulletPoints: [
          "Merancang arsitektur microservices Node.js 500k transaksi harian.",
          "Optimasi query PostgreSQL, latensi turun dari 450ms ke 85ms."
        ],
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
        starSummary: "Sistem task scheduling terdistribusi dengan Redis lock untuk race condition mitigation.",
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
        degree: "D4 Teknik Informatika",
        graduationYear: "2026",
        gpa: "3.85 / 4.00"
      }
    ],
  };
}

function getNextStatus(current: JobStatus): JobStatus | null {
  switch (current) {
    case JobStatus.PENDING: return JobStatus.SCRAPING_LINKEDIN;
    case JobStatus.SCRAPING_LINKEDIN: return JobStatus.FETCHING_GITHUB;
    case JobStatus.FETCHING_GITHUB: return JobStatus.AI_SYNTHESIZING;
    case JobStatus.AI_SYNTHESIZING: return JobStatus.AWAITING_CURATION;
    case JobStatus.AWAITING_CURATION: return JobStatus.GENERATING_PDF;
    case JobStatus.GENERATING_PDF: return JobStatus.DELIVERING_EMAIL;
    case JobStatus.DELIVERING_EMAIL: return JobStatus.COMPLETED;
    default: return null;
  }
}

function progressForStatus(status: JobStatus): number {
  switch (status) {
    case JobStatus.PENDING: return 0;
    case JobStatus.SCRAPING_LINKEDIN: return 20;
    case JobStatus.FETCHING_GITHUB: return 45;
    case JobStatus.AI_SYNTHESIZING: return 70;
    case JobStatus.AWAITING_CURATION: return 90;
    case JobStatus.GENERATING_PDF: return 95;
    case JobStatus.DELIVERING_EMAIL: return 98;
    case JobStatus.COMPLETED: return 100;
    case JobStatus.FAILED: return 100;
    default: return 0;
  }
}

function statusDelay(status: JobStatus): number {
  switch (status) {
    case JobStatus.PENDING: return 500;
    case JobStatus.SCRAPING_LINKEDIN: return 2000;
    case JobStatus.FETCHING_GITHUB: return 1500;
    case JobStatus.AI_SYNTHESIZING: return 3000;
    case JobStatus.AWAITING_CURATION: return 0;    // manual trigger
    case JobStatus.GENERATING_PDF: return 1500;
    case JobStatus.DELIVERING_EMAIL: return 1000;
    default: return 0;
  }
}

export class MockUiPathGateway implements IUiPathGateway {
  async submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission> {
    const jobId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const job: MockJob = {
      jobId,
      status: JobStatus.PENDING,
      progress: progressForStatus(JobStatus.PENDING),
    };
    jobs.set(jobId, job);
    this.advanceJob(jobId, request);
    return { jobId };
  }

  private advanceJob(jobId: string, request: GenerateCVRequestDTO) {
    const job = jobs.get(jobId);
    if (!job) return;
    const status = job.status;
    const delay = statusDelay(status);
    if (status === JobStatus.AWAITING_CURATION) {
      // Wait for approveResume
      job.draftData = genMockResume(request);
      job.progress = progressForStatus(status);
      jobs.set(jobId, job);
      return;
    }
    job.timerId = setTimeout(() => {
      const next = getNextStatus(status);
      if (!next) return;
      job.status = next;
      job.progress = progressForStatus(next);
      if (next === JobStatus.AWAITING_CURATION) {
        job.draftData = genMockResume(request);
      } else if (next === JobStatus.COMPLETED) {
        job.downloadUrl = `/mock/${jobId}/download.pdf`;
      }
      jobs.set(jobId, job);
      this.advanceJob(jobId, request);
    }, delay);
  }

  async getJobProgress(jobId: string): Promise<JobProgress> {
    const job = jobs.get(jobId);
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
    const job = jobs.get(jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== JobStatus.AWAITING_CURATION) throw new Error("Job is not awaiting curation");
    if (curatedData && typeof curatedData === "object") {
      job.draftData = { ...job.draftData, ...(curatedData as Partial<ResumePayload>) } as ResumePayload;
    }
    job.status = JobStatus.GENERATING_PDF;
    job.progress = progressForStatus(JobStatus.GENERATING_PDF);
    jobs.set(jobId, job);
    // Simulate the rest
    setTimeout(() => {
      job.status = JobStatus.DELIVERING_EMAIL;
      job.progress = progressForStatus(JobStatus.DELIVERING_EMAIL);
      jobs.set(jobId, job);
      setTimeout(() => {
        job.status = JobStatus.COMPLETED;
        job.progress = 100;
        job.downloadUrl = `/mock/${jobId}/download.pdf`;
        jobs.set(jobId, job);
      }, statusDelay(JobStatus.DELIVERING_EMAIL));
    }, statusDelay(JobStatus.GENERATING_PDF));
  }

  async downloadCv(jobId: string): Promise<Blob> {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const outputsDir = path.resolve(process.cwd(), "../robot/Data/Outputs");
      if (fs.existsSync(outputsDir)) {
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
          return new Blob([buffer], { type: "application/pdf" });
        }
      }
    } catch {
      // Fallback
    }

    const content = "%PDF-1.3\n% mock pdf file: " + jobId + "\n";
    return new Blob([content], { type: "application/pdf" });
  }
}

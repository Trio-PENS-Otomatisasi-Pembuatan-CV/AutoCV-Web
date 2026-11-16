import type { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import type { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import { createJob, getJob, updateJob } from "@/infrastructure/storage/JobStore";

// Escape a single line for use inside a PDF text-showing string literal.
function pdfEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

// Build a structurally valid, single-page PDF with a Helvetica text stream.
// Used as a fallback so the browser does not report the file as "damaged".
function buildMinimalPdf(title: string, lines: string[]): Blob {
  // Stream content: title + body lines, each on its own show-text operation.
  let content = "";
  content += `BT\n/F2 18 Tf\n72 740 Td\n(${pdfEscape(title)}) Tj\nET\n`;
  let y = 705;
  for (const line of lines) {
    const isSection = /Summary/.test(line);
    const size = isSection ? 12 : 10;
    const font = isSection ? "/F2" : "/F1";
    content += `BT\n${font} ${size} Tf\n72 ${y} Td\n(${pdfEscape(line)}) Tj\nET\n`;
    y -= 16;
  }
  const stream = Buffer.from(content, "latin1");

  const objects: Buffer[] = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    Buffer.from(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"
    ),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
    Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`), stream, Buffer.from("\nendstream")]),
  ];

  let pdf = Buffer.from("%PDF-1.4\n");
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf = Buffer.concat([pdf, Buffer.from(`${i + 1} 0 obj\n`), obj, Buffer.from("\nendobj\n")]);
  });

  const xrefPos = pdf.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  pdf = Buffer.concat([pdf, Buffer.from(xref, "latin1")]);
  return new Blob([pdf], { type: "application/pdf" });
}

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
          "Optimasi query PostgreSQL, latensi turun dari 450ms ke 85ms.",
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
        gpa: "3.85 / 4.00",
      },
    ],
  };
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

export class MockUiPathGateway implements IUiPathGateway {
  async submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission> {
    const jobId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    createJob(jobId, request, JobStatus.PENDING);
    updateJob(jobId, { progress: progressForStatus(JobStatus.PENDING) });

    this.advanceJob(jobId, request);
    return { jobId };
  }

  private advanceJob(jobId: string, request: GenerateCVRequestDTO) {
    const job = getJob(jobId);
    if (!job) return;
    const status = job.status;
    const delay = statusDelay(status);

    if (status === JobStatus.AWAITING_CURATION || status === JobStatus.GENERATING_PDF || status === JobStatus.COMPLETED) {
      return;
    }

    setTimeout(() => {
      const currentJob = getJob(jobId);
      if (!currentJob) return;
      const currentStatus = currentJob.status;
      const next = getNextStatus(currentStatus);
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
    if (
      job.status !== JobStatus.AWAITING_CURATION &&
      job.status !== JobStatus.GENERATING_PDF &&
      job.status !== JobStatus.DELIVERING_EMAIL
    ) {
      throw new Error(`Job cannot be approved in status '${job.status}'`);
    }

    const mergedDraft =
      curatedData && typeof curatedData === "object"
        ? ({ ...job.draftData, ...(curatedData as Partial<ResumePayload>) } as ResumePayload)
        : job.draftData;

    const alreadyProcessing =
      job.status === JobStatus.GENERATING_PDF || job.status === JobStatus.DELIVERING_EMAIL;

    updateJob(jobId, {
      draftData: mergedDraft,
      status: alreadyProcessing ? job.status : JobStatus.GENERATING_PDF,
      progress: progressForStatus(alreadyProcessing ? job.status : JobStatus.GENERATING_PDF),
    });

    // Only schedule the simulated pipeline once (avoid duplicate timers on re-approve)
    if (alreadyProcessing) return;

    setTimeout(() => {
      updateJob(jobId, {
        status: JobStatus.DELIVERING_EMAIL,
        progress: progressForStatus(JobStatus.DELIVERING_EMAIL),
      });

      setTimeout(() => {
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

    const job = getJob(jobId);
    if (job?.pdfBase64) {
      const buffer = Buffer.from(job.pdfBase64, "base64");
      return new Blob([buffer], { type: "application/pdf" });
    }

    // Generate a structurally valid minimal PDF (no external deps) so the
    // browser can open it instead of reporting "PDF document is damaged".
    const p = job?.draftData?.profile;
    const title = p?.fullName || "Candidate Resume";
    const lines = [
      p?.headline ? p.headline : "ATS Resume",
      p?.location ? `Location: ${p.location}` : "",
      p?.email ? `Email: ${p.email}` : "",
      p?.phone ? `Phone: ${p.phone}` : "",
      "",
      "Summary",
      p?.summary ? (p.summary.length > 90 ? p.summary.slice(0, 90) + "..." : p.summary) : "",
      "",
      "Generated by AutoCV (mock mode)",
      `Job: ${jobId}`,
    ].filter((l) => l !== null);

    return buildMinimalPdf(title, lines);
  }

}

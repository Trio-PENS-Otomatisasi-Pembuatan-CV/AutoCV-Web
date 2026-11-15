import type { JobStatus, GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import { JobStatus as JobStatusEnum } from "@/application/dto/GenerateCVRequestDTO";

export interface JobRecord {
  jobId: string;
  status: JobStatus;
  progress: number;
  createdAt: number;
  updatedAt: number;

  // Request parameters
  request?: GenerateCVRequestDTO;

  // Robot data
  draftData?: ResumePayload;
  pdfBase64?: string;
  downloadUrl?: string;

  // Orchestrator metadata
  orchestratorJobId?: string;

  // Error details
  errorMessage?: string;
  errorStage?: string;
  errorDetails?: unknown;

  // Delivery status
  emailSent?: boolean;
  emailSentAt?: string;
}

// In-memory global store across serverless/node module loads
const globalForJobs = globalThis as unknown as {
  __autocv_jobs_map?: Map<string, JobRecord>;
  __autocv_cleanup_timer?: NodeJS.Timeout;
};

export const jobs: Map<string, JobRecord> =
  globalForJobs.__autocv_jobs_map || new Map<string, JobRecord>();

if (!globalForJobs.__autocv_jobs_map) {
  globalForJobs.__autocv_jobs_map = jobs;
}

export function createJob(
  jobId: string,
  request?: GenerateCVRequestDTO,
  initialStatus: JobStatus = "PENDING" as JobStatus
): JobRecord {
  const now = Date.now();
  const record: JobRecord = {
    jobId,
    status: initialStatus,
    progress: 0,
    createdAt: now,
    updatedAt: now,
    request,
  };
  jobs.set(jobId, record);
  return record;
}

export function getJob(jobId: string): JobRecord | undefined {
  return jobs.get(jobId);
}

export function updateJob(jobId: string, updates: Partial<JobRecord>): JobRecord {
  const existing = jobs.get(jobId);
  const now = Date.now();
  if (!existing) {
    const created: JobRecord = {
      jobId,
      status: (updates.status || "PENDING") as JobStatus,
      progress: updates.progress ?? 0,
      createdAt: now,
      updatedAt: now,
      ...updates,
    };
    jobs.set(jobId, created);
    return created;
  }

  const updated: JobRecord = {
    ...existing,
    ...updates,
    updatedAt: now,
  };
  jobs.set(jobId, updated);
  return updated;
}

export function deleteJob(jobId: string): boolean {
  return jobs.delete(jobId);
}

// 1-hour TTL cleanup running every 5 minutes
const TTL_MS = 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Jobs stuck in-progress for more than 10 minutes are marked FAILED.
// AWAITING_CURATION is excluded (legitimate human pause).
const STALE_TIMEOUT_MS = 10 * 60 * 1000;

const IN_PROGRESS_STATUSES: ReadonlySet<JobStatus> = new Set<JobStatus>([
  JobStatusEnum.PENDING,
  JobStatusEnum.SCRAPING_LINKEDIN,
  JobStatusEnum.FETCHING_GITHUB,
  JobStatusEnum.AI_SYNTHESIZING,
  JobStatusEnum.GENERATING_PDF,
  JobStatusEnum.DELIVERING_EMAIL,
]);

if (!globalForJobs.__autocv_cleanup_timer) {
  const timer = setInterval(() => {
    const now = Date.now();
    const ttlCutoff = now - TTL_MS;
    const staleCutoff = now - STALE_TIMEOUT_MS;

    for (const [id, job] of jobs.entries()) {
      // Mark stale in-progress jobs as FAILED (before TTL delete)
      if (
        IN_PROGRESS_STATUSES.has(job.status) &&
        job.updatedAt < staleCutoff
      ) {
        updateJob(id, {
          status: JobStatusEnum.FAILED,
          progress: 100,
          errorMessage: "Job timed out: no progress update received within 10 minutes.",
          errorStage: job.status,
          errorDetails: { lastUpdatedAt: new Date(job.updatedAt).toISOString() },
        });
        continue;
      }

      // TTL delete: remove records untouched for 1 hour
      if (job.updatedAt < ttlCutoff) {
        jobs.delete(id);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow Node process to exit gracefully
  if (typeof timer.unref === "function") {
    timer.unref();
  }
  globalForJobs.__autocv_cleanup_timer = timer;
}

import type { JobStatus, GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";

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

if (!globalForJobs.__autocv_cleanup_timer) {
  const timer = setInterval(() => {
    const cutoff = Date.now() - TTL_MS;
    for (const [id, job] of jobs.entries()) {
      if (job.updatedAt < cutoff) {
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

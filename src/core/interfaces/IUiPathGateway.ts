import type {
  GenerateCVRequestDTO,
  JobStatus,
} from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";

export interface JobSubmission {
  jobId: string;
}

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
  draftData?: ResumePayload;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface IUiPathGateway {
  submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission>;
  getJobProgress(jobId: string): Promise<JobProgress>;
  approveResume(jobId: string, curatedData?: unknown): Promise<void>;
  downloadCv(jobId: string): Promise<Blob>;
}

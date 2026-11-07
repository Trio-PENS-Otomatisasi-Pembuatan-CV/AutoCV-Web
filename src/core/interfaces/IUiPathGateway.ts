import type {
  GenerateCVRequestDTO,
  JobStatus,
} from "@/application/dto/GenerateCVRequestDTO";

export interface JobSubmission {
  jobId: string;
}

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
}

export interface IUiPathGateway {
  submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission>;
  getJobProgress(jobId: string): Promise<JobProgress>;
  approveResume(jobId: string): Promise<void>;
  downloadCv(jobId: string): Promise<Blob>;
}

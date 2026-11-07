import { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";

export class LiveUiPathGateway implements IUiPathGateway {
  // ponytail: Real implementation should POST to UiPath Cloud Orchestrator endpoints using `apiClient` with credentials from env
  async submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission> {
    throw new Error("LiveUiPathGateway: not yet implemented");
  }

  async getJobProgress(jobId: string): Promise<JobProgress> {
    throw new Error("LiveUiPathGateway: not yet implemented");
  }

  async approveResume(jobId: string, curatedData?: unknown): Promise<void> {
    throw new Error("LiveUiPathGateway: not yet implemented");
  }

  async downloadCv(jobId: string): Promise<Blob> {
    throw new Error("LiveUiPathGateway: not yet implemented");
  }
}

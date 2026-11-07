import { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";

export class LiveUiPathGateway implements IUiPathGateway {
  // ponytail: Real implementation should POST to UiPath Cloud Orchestrator endpoints using `apiClient` with credentials from env
  async submitJob(_request: GenerateCVRequestDTO): Promise<JobSubmission> {
    void _request;
    throw new Error("LiveUiPathGateway: not yet implemented");
  }

  async getJobProgress(_jobId: string): Promise<JobProgress> {
    void _jobId;
    throw new Error("LiveUiPathGateway: not yet implemented");
  }

  async approveResume(_jobId: string, _curatedData?: unknown): Promise<void> {
    void _jobId;
    void _curatedData;
    throw new Error("LiveUiPathGateway: not yet implemented");
  }

  async downloadCv(_jobId: string): Promise<Blob> {
    void _jobId;
    throw new Error("LiveUiPathGateway: not yet implemented");
  }
}

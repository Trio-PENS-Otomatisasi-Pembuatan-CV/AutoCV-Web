import { IUiPathGateway } from "@/core/interfaces/IUiPathGateway";
import { JobProgress } from "@/core/interfaces/IUiPathGateway";

export class GetJobProgressUseCase {
  constructor(private readonly gateway: IUiPathGateway) {}

  async execute(jobId: string): Promise<JobProgress> {
    return this.gateway.getJobProgress(jobId);
  }
}

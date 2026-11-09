import { IUiPathGateway } from "@/core/interfaces/IUiPathGateway";

export class ApproveResumeUseCase {
  constructor(private readonly gateway: IUiPathGateway) {}

  async execute(jobId: string, curatedData?: unknown): Promise<void> {
    return this.gateway.approveResume(jobId, curatedData);
  }
}

import { IUiPathGateway } from "@/core/interfaces/IUiPathGateway";
import { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";

export class SubmitJobUseCase {
  constructor(private readonly gateway: IUiPathGateway) {}

  async execute(request: GenerateCVRequestDTO) {
    return this.gateway.submitJob(request);
  }
}

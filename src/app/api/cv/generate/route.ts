import { NextRequest, NextResponse } from "next/server";
import { getUiPathGateway } from "@/infrastructure/gateways/GatewayFactory";
import { SubmitJobUseCase } from "@/application/use-cases/SubmitJobUseCase";
import { GenerateCVRequestSchema } from "@/application/dto/GenerateCVRequestDTO";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateCVRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const gateway = getUiPathGateway();
    const useCase = new SubmitJobUseCase(gateway);
    const result = await useCase.execute(parsed.data);

    return NextResponse.json(result, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to submit CV job" },
      { status: 500 }
    );
  }
}

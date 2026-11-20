import { NextRequest, NextResponse } from "next/server";
import { getUiPathGateway } from "@/infrastructure/gateways/GatewayFactory";
import { ApproveResumeUseCase } from "@/application/use-cases/ApproveResumeUseCase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json().catch(() => ({}));
    const gateway = getUiPathGateway();
    const useCase = new ApproveResumeUseCase(gateway);
    await useCase.execute(jobId, body.curatedData);

    return NextResponse.json({ success: true, status: "GENERATING_PDF" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to approve resume";
    console.error(`[Approve API Error] Job:`, error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

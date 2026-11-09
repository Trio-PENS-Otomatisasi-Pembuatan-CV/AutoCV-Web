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
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to approve resume" },
      { status: 500 }
    );
  }
}

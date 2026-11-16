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
    const isStateConflict =
      message.includes("cannot be approved") ||
      message.includes("not awaiting curation") ||
      message.includes("not in AWAITING_CURATION");
    const isNotFound = message.includes("not found");
    return NextResponse.json(
      { error: message },
      { status: isStateConflict ? 409 : isNotFound ? 404 : 500 }
    );
  }
}

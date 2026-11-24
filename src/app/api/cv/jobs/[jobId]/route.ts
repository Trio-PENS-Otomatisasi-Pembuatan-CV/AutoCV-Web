import { NextRequest, NextResponse } from "next/server";
import { getUiPathGateway } from "@/infrastructure/gateways/GatewayFactory";
import { GetJobProgressUseCase } from "@/application/use-cases/GetJobProgressUseCase";
import { getJob } from "@/infrastructure/storage/JobStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const gateway = getUiPathGateway();
    const useCase = new GetJobProgressUseCase(gateway);
    const progress = await useCase.execute(jobId);
    const job = getJob(jobId);

    return NextResponse.json({
      jobId: progress.jobId,
      status: progress.status,
      progressPercent: progress.progress,
      draftData: progress.draftData,
      downloadUrl: progress.downloadUrl,
      errorMessage: progress.errorMessage,
      emailSent: job?.emailSent ?? false,
      emailSentAt: job?.emailSentAt ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Job not found";
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
}
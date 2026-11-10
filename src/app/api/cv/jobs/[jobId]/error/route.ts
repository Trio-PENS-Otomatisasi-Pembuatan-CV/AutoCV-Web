import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: `Job with ID '${jobId}' not found` },
        { status: 404 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      errorMessage?: string;
      errorStage?: string;
      errorDetails?: unknown;
    };

    updateJob(jobId, {
      status: JobStatus.FAILED,
      progress: 100,
      errorMessage: body.errorMessage || "Unknown error reported by robot",
      errorStage: body.errorStage || "EXECUTION",
      errorDetails: body.errorDetails,
    });

    return NextResponse.json({
      success: true,
      message: "Job error logged and marked as FAILED",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

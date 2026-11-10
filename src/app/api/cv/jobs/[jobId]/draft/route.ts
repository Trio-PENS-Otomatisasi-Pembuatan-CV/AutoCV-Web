import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import type { ResumePayload } from "@/core/entities/ResumePayload";

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
      draftData?: ResumePayload;
    };

    if (!body.draftData) {
      return NextResponse.json(
        { error: "Missing required 'draftData' payload" },
        { status: 400 }
      );
    }

    updateJob(jobId, {
      status: JobStatus.AWAITING_CURATION,
      progress: 75,
      draftData: body.draftData,
    });

    return NextResponse.json({
      success: true,
      message: "Draft received and stored",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

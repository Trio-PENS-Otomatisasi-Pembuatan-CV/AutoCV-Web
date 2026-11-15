import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { DraftPayloadSchema, normalizeDraftPayload } from "@/application/dto/DraftPayloadDTO";

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

    const body = await req.json().catch(() => ({}));
    const rawDraft = body?.draftData ?? body;

    const parsed = DraftPayloadSchema.safeParse(rawDraft);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid draft payload",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const normalized = normalizeDraftPayload(parsed.data);

    updateJob(jobId, {
      status: JobStatus.AWAITING_CURATION,
      progress: 75,
      draftData: normalized,
    });

    return NextResponse.json({
      success: true,
      message: "Draft received, normalized, and stored",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

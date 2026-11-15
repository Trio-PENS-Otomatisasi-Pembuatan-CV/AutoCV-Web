import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
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

    if (job.status !== "AWAITING_CURATION") {
      return NextResponse.json(
        { error: `Job is not in AWAITING_CURATION state (current: ${job.status})` },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawDraft = body?.draftData ?? body;

    const parsed = DraftPayloadSchema.safeParse(rawDraft);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid curation payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const normalized = normalizeDraftPayload(parsed.data);

    // Merge: curation updates the existing draft without triggering PDF generation
    const merged = job.draftData
      ? { ...job.draftData, ...normalized }
      : normalized;

    updateJob(jobId, { draftData: merged });

    return NextResponse.json({
      success: true,
      message: "Curation draft saved.",
      jobId,
      status: "AWAITING_CURATION",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save curation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

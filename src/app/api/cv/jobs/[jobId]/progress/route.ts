import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";

const VALID_PROGRESS_STATUSES: ReadonlySet<string> = new Set<string>([
  JobStatus.SCRAPING_LINKEDIN,
  JobStatus.FETCHING_GITHUB,
  JobStatus.AI_SYNTHESIZING,
  JobStatus.GENERATING_PDF,
  JobStatus.DELIVERING_EMAIL,
]);

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
      status?: string;
      progress?: number;
    };

    if (!body.status || !VALID_PROGRESS_STATUSES.has(body.status)) {
      return NextResponse.json(
        {
          error: `Invalid or non-progressable status: '${body.status}'. Allowed: ${[...VALID_PROGRESS_STATUSES].join(", ")}`,
        },
        { status: 400 }
      );
    }

    updateJob(jobId, {
      status: body.status as JobStatus,
      progress: typeof body.progress === "number" ? body.progress : job.progress,
    });

    return NextResponse.json({
      success: true,
      message: `Progress updated to ${body.status}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update progress";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

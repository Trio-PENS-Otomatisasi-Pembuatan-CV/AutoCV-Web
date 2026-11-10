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
      pdfBase64?: string;
      downloadUrl?: string;
      emailSent?: boolean;
      emailSentAt?: string;
    };

    if (!body.pdfBase64 && !body.downloadUrl) {
      return NextResponse.json(
        { error: "Must provide either 'pdfBase64' or 'downloadUrl'" },
        { status: 400 }
      );
    }

    updateJob(jobId, {
      status: JobStatus.COMPLETED,
      progress: 100,
      pdfBase64: body.pdfBase64 || job.pdfBase64,
      downloadUrl: body.downloadUrl || `/api/cv/jobs/${jobId}/download`,
      emailSent: body.emailSent ?? job.emailSent,
      emailSentAt: body.emailSentAt || (body.emailSent ? new Date().toISOString() : undefined),
    });

    return NextResponse.json({
      success: true,
      message: "Job marked as COMPLETED and PDF stored",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

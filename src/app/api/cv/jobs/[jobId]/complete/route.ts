import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { sendCVEmail } from "@/infrastructure/email/EmailService";

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
    });

    const recipientEmail = job.request?.recipientEmail ?? job.request?.email;
    if (recipientEmail) {
      try {
        const host =
          req.headers.get("x-forwarded-host") ??
          req.headers.get("host") ??
          "localhost:3000";
        const proto = req.headers.get("x-forwarded-proto") ?? "http";
        const baseUrl = `${proto}://${host}`;

        const emailResult = await sendCVEmail({
          jobId,
          recipientEmail,
          candidateName: job.draftData?.profile?.fullName ?? "Candidate",
          baseUrl,
          pdfBase64: body.pdfBase64 || job.pdfBase64,
        });

        updateJob(jobId, {
          emailSent: true,
          emailSentAt: new Date().toISOString(),
        });

        console.log(
          `[/complete] Email dispatched — mode: ${emailResult.mode}, to: ${recipientEmail}`
        );
      } catch (emailErr) {
        console.error("[/complete] Email dispatch failed:", emailErr);
      }
    } else {
      console.warn(`[/complete] No recipientEmail on job ${jobId} — skipping email.`);
    }

    return NextResponse.json({
      success: true,
      message: "Job marked as COMPLETED and PDF stored",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
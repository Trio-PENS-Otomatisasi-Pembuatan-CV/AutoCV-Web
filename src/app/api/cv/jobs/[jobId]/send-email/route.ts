import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { sendCVEmail } from "@/infrastructure/email/EmailService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({})) as { recipientEmail?: string };
    const recipientEmail =
      body.recipientEmail ??
      job.request?.recipientEmail ??
      job.request?.email;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No recipient email found for this job" },
        { status: 400 }
      );
    }

    const host =
      req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${proto}://${host}`;

    const result = await sendCVEmail({
      jobId,
      recipientEmail,
      candidateName: job.draftData?.profile?.fullName ?? "Candidate",
      baseUrl,
    });

    updateJob(jobId, {
      emailSent: true,
      emailSentAt: new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    console.error("[send-email route]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/infrastructure/storage/JobStore";
import { getUiPathGateway } from "@/infrastructure/gateways/GatewayFactory";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = getJob(jobId);

    // If PDF base64 is in JobStore, serve it directly
    if (job?.pdfBase64) {
      const buffer = Buffer.from(job.pdfBase64, "base64");
      const name = job.draftData?.profile.fullName
        ? job.draftData.profile.fullName.replace(/\s+/g, "_")
        : jobId;

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="ATS_Resume_${name}.pdf"`,
        },
      });
    }

    // Fall back to gateway downloadCv (e.g. MockUiPathGateway or custom blob logic)
    const gateway = getUiPathGateway();
    const blob = await gateway.downloadCv(jobId);
    const arrayBuffer = await blob.arrayBuffer();

    const fallbackName = job?.draftData?.profile.fullName
      ? job.draftData.profile.fullName.replace(/\s+/g, "_")
      : jobId;

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ATS_Resume_${fallbackName}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "File download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

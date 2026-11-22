import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { getUiPathGateway } from "@/infrastructure/gateways/GatewayFactory";
import { generateAtsPdf } from "@/infrastructure/pdf/PdfGeneratorService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const isDownload = req.nextUrl.searchParams.get("download") === "true";
    const dispositionType = isDownload ? "attachment" : "inline";
    const job = getJob(jobId);

    const name = job?.draftData?.profile.fullName
      ? job.draftData.profile.fullName.replace(/\s+/g, "_")
      : jobId;

    if (job?.pdfBase64) {
      const buffer = Buffer.from(job.pdfBase64, "base64");
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${dispositionType}; filename="ATS_Resume_${name}.pdf"`,
        },
      });
    }

    try {
      const gateway = getUiPathGateway();
      const result = await gateway.downloadCv(jobId);
      if (result instanceof Response) {
        const arrayBuffer = await result.arrayBuffer();
        return new NextResponse(arrayBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `${dispositionType}; filename="ATS_Resume_${name}.pdf"`,
          },
        });
      }
      const arrayBuffer = await result.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${dispositionType}; filename="ATS_Resume_${name}.pdf"`,
        },
      });
    } catch (gatewayErr) {
      console.warn(`[Download API] Gateway download failed for ${jobId}, attempting dynamic generation:`, gatewayErr);
    }

    if (job?.draftData) {
      const buffer = await generateAtsPdf(job.draftData);
      updateJob(jobId, { pdfBase64: buffer.toString("base64") });
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
          controller.close();
        }
      });
      return new NextResponse(readable, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${dispositionType}; filename="ATS_Resume_${name}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "PDF not found for this job" }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "File download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
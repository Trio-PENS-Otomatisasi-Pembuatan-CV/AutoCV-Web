import { NextRequest, NextResponse } from "next/server";
import { getUiPathGateway } from "@/infrastructure/gateways/GatewayFactory";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const gateway = getUiPathGateway();
    const blob = await gateway.downloadCv(jobId);
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ATS_Resume_${jobId}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "File download failed" },
      { status: 500 }
    );
  }
}

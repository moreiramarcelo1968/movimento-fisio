import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { reportFileName } from "@/lib/csv";
import { buildReportPdf } from "@/lib/pdf";
import { getSettings } from "@/lib/queries";
import { buildReport, parseReportFilters } from "@/lib/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const filters = parseReportFilters(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  const [report, clinic] = await Promise.all([buildReport(filters), getSettings()]);
  const bytes = await buildReportPdf(report, clinic.clinicName);

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportFileName(report, "pdf")}"`,
      "Cache-Control": "no-store",
    },
  });
}

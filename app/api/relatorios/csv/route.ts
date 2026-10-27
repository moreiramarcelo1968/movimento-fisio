import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildReportCsv, reportFileName } from "@/lib/csv";
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
  const csv = buildReportCsv(report, clinic.clinicName);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reportFileName(report, "csv")}"`,
      "Cache-Control": "no-store",
    },
  });
}

import { formatBRL } from "./format";
import { formatDate } from "./time";
import type { Report } from "./report";

function cell(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  if (/[;"\r\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function money(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function buildReportCsv(report: Report, clinicName: string): string {
  const lines: string[] = [];
  const period = `${formatDate(report.from)} a ${formatDate(report.to)}`;

  lines.push(cell("Relatório de atendimentos"));
  lines.push([cell("Clínica"), cell(clinicName)].join(";"));
  lines.push([cell("Período"), cell(period)].join(";"));
  lines.push([cell("Paciente"), cell(report.patientName ?? "Todos")].join(";"));
  lines.push([cell("Tipo de atendimento"), cell(report.serviceTypeName ?? "Todos")].join(";"));
  lines.push([cell("Status"), cell(report.statusLabel)].join(";"));
  lines.push("");

  lines.push(
    [
      "Tipo de atendimento",
      "Quantidade",
      "Valor unitário médio",
      "Total",
    ].join(";"),
  );

  for (const row of report.rows) {
    lines.push(
      [cell(row.name), String(row.count), money(row.averageCents), money(row.totalCents)].join(";"),
    );
  }

  lines.push(
    ["TOTAL GERAL", String(report.totalCount), money(report.averageCents), money(report.totalCents)].join(
      ";",
    ),
  );

  lines.push("");
  lines.push("Resumo por status no período");
  lines.push("Status;Quantidade");
  for (const [status, count] of Object.entries(report.statusCounts)) {
    lines.push([cell(status), String(count)].join(";"));
  }

  lines.push("");
  lines.push(`Total realizado;${formatBRL(report.totalCents)}`);

  return `\uFEFF${lines.join("\r\n")}`;
}

export function reportFileName(report: Report, extension: string): string {
  const base = `relatorio-atendimentos-${report.filters.de}-a-${report.filters.ate}`;
  return `${base}.${extension}`;
}

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { formatBRL } from "./format";
import { formatDate } from "./time";
import type { Report } from "./report";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const PINE = rgb(0.051, 0.31, 0.278);
const PINE_DEEP = rgb(0.035, 0.231, 0.208);
const INK = rgb(0.078, 0.125, 0.114);
const MUTED = rgb(0.32, 0.376, 0.356);
const LINE = rgb(0.866, 0.89, 0.866);
const SOFT = rgb(0.949, 0.956, 0.945);
const WHITE = rgb(1, 1, 1);

function sanitize(value: string): string {
  return value.replace(/\u00A0/g, " ").replace(/\u2013/g, "-").replace(/\u2014/g, "-");
}

function money(cents: number): string {
  return sanitize(formatBRL(cents));
}

function fit(text: string, font: PDFFont, size: number, maxWidth: number): string {
  const clean = sanitize(text);
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;
  let trimmed = clean;
  while (trimmed.length > 1 && font.widthOfTextAtSize(`${trimmed}...`, size) > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}...`;
}

function drawRight(
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  xRight: number,
  y: number,
  font: PDFFont,
  size: number,
  color = INK,
) {
  const value = sanitize(text);
  const width = font.widthOfTextAtSize(value, size);
  page.drawText(value, { x: xRight - width, y, size, font, color });
}

export async function buildReportPdf(report: Report, clinicName: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Relatório de atendimentos");
  doc.setAuthor(clinicName);
  doc.setSubject(`Período de ${formatDate(report.from)} a ${formatDate(report.to)}`);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT;

  const period = `${formatDate(report.from)} a ${formatDate(report.to)}`;
  const filtersLine = [
    `Paciente: ${report.patientName ?? "Todos"}`,
    `Tipo: ${report.serviceTypeName ?? "Todos"}`,
    `Status: ${report.statusLabel}`,
  ].join("   |   ");

  function drawHeader() {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 104,
      width: PAGE_WIDTH,
      height: 104,
      color: PINE,
    });

    page.drawText(fit(clinicName, bold, 17, CONTENT_WIDTH - 120), {
      x: MARGIN,
      y: PAGE_HEIGHT - 48,
      size: 17,
      font: bold,
      color: WHITE,
    });

    page.drawText("Relatório de atendimentos", {
      x: MARGIN,
      y: PAGE_HEIGHT - 72,
      size: 10,
      font: regular,
      color: rgb(0.82, 0.89, 0.86),
    });

    page.drawText("Movimento", {
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize("Movimento", 9),
      y: PAGE_HEIGHT - 48,
      size: 9,
      font: regular,
      color: rgb(0.82, 0.89, 0.86),
    });

    page.drawText(period, {
      x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(period, 10),
      y: PAGE_HEIGHT - 72,
      size: 10,
      font: bold,
      color: WHITE,
    });
  }

  function drawMeta() {
    y = PAGE_HEIGHT - 132;
    page.drawText("Período", { x: MARGIN, y, size: 8.5, font: bold, color: MUTED });
    page.drawText(period, { x: MARGIN, y: y - 14, size: 10.5, font: regular, color: INK });

    page.drawText("Filtros aplicados", {
      x: MARGIN + 190,
      y,
      size: 8.5,
      font: bold,
      color: MUTED,
    });
    page.drawText(fit(filtersLine, regular, 9.5, CONTENT_WIDTH - 190), {
      x: MARGIN + 190,
      y: y - 14,
      size: 9.5,
      font: regular,
      color: INK,
    });

    y -= 44;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.7,
      color: LINE,
    });
    y -= 24;
  }

  function drawTableHeader() {
    page.drawRectangle({
      x: MARGIN,
      y: y - 10,
      width: CONTENT_WIDTH,
      height: 26,
      color: PINE_DEEP,
    });
    page.drawText("Tipo de atendimento", {
      x: MARGIN + 10,
      y: y - 2,
      size: 9,
      font: bold,
      color: WHITE,
    });
    drawRight(page, "Qtd.", PAGE_WIDTH - MARGIN - 190, y - 2, bold, 9, WHITE);
    drawRight(page, "Médio", PAGE_WIDTH - MARGIN - 110, y - 2, bold, 9, WHITE);
    drawRight(page, "Total", PAGE_WIDTH - MARGIN - 12, y - 2, bold, 9, WHITE);
    y -= 26;
  }

  function drawColumnLabels() {
    drawTableHeader();
  }

  drawHeader();
  drawMeta();

  if (report.rows.length === 0) {
    page.drawText("Nenhum atendimento encontrado para os filtros selecionados.", {
      x: MARGIN,
      y: y - 14,
      size: 10.5,
      font: regular,
      color: MUTED,
    });
    y -= 40;
  } else {
    drawColumnLabels();

    report.rows.forEach((row, index) => {
      if (y < 110) {
        page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - 60;
        drawColumnLabels();
      }

      const rowHeight = 24;
      if (index % 2 === 1) {
        page.drawRectangle({
          x: MARGIN,
          y: y - rowHeight + 6,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: SOFT,
        });
      }

      page.drawText(fit(row.name, regular, 9.5, 240), {
        x: MARGIN + 10,
        y: y - 10,
        size: 9.5,
        font: regular,
        color: INK,
      });
      drawRight(page, String(row.count), PAGE_WIDTH - MARGIN - 190, y - 10, regular, 9.5);
      drawRight(page, money(row.averageCents), PAGE_WIDTH - MARGIN - 110, y - 10, regular, 9.5);
      drawRight(page, money(row.totalCents), PAGE_WIDTH - MARGIN - 12, y - 10, bold, 9.5);

      y -= rowHeight;
      page.drawLine({
        start: { x: MARGIN, y: y + 6 },
        end: { x: PAGE_WIDTH - MARGIN, y: y + 6 },
        thickness: 0.4,
        color: LINE,
      });
    });

    if (y < 130) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 60;
    }

    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1.2,
      color: PINE,
    });

    page.drawText("Total geral", {
      x: MARGIN + 10,
      y: y - 20,
      size: 10.5,
      font: bold,
      color: INK,
    });
    drawRight(
      page,
      String(report.totalCount),
      PAGE_WIDTH - MARGIN - 190,
      y - 20,
      bold,
      10.5,
    );
    drawRight(
      page,
      money(report.averageCents),
      PAGE_WIDTH - MARGIN - 110,
      y - 20,
      bold,
      10.5,
    );
    drawRight(page, money(report.totalCents), PAGE_WIDTH - MARGIN - 12, y - 20, bold, 11);

    y -= 48;
  }

  const statusEntries = Object.entries(report.statusCounts);
  if (statusEntries.length > 0) {
    page.drawText("Atendimentos no período por status", {
      x: MARGIN,
      y,
      size: 10,
      font: bold,
      color: PINE,
    });
    y -= 18;

    for (const [status, count] of statusEntries) {
      const labels: Record<string, string> = {
        scheduled: "Agendados",
        completed: "Realizados",
        no_show: "Faltas",
        canceled: "Cancelados",
      };
      page.drawText(`${labels[status] ?? status}: ${count}`, {
        x: MARGIN,
        y,
        size: 9.5,
        font: regular,
        color: INK,
      });
      y -= 15;
    }
  }

  const pages = doc.getPages();
  pages.forEach((item, index) => {
    const label = `Página ${index + 1} de ${pages.length}`;
    item.drawLine({
      start: { x: MARGIN, y: 46 },
      end: { x: PAGE_WIDTH - MARGIN, y: 46 },
      thickness: 0.5,
      color: LINE,
    });
    item.drawText(`Emitido em ${formatDate(new Date())}`, {
      x: MARGIN,
      y: 32,
      size: 8,
      font: regular,
      color: MUTED,
    });
    item.drawText(label, {
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(label, 8),
      y: 32,
      size: 8,
      font: regular,
      color: MUTED,
    });
  });

  return doc.save();
}

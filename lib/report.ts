import { and, eq, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { appointments, patients, serviceTypes } from "../db/schema";
import { isUuid } from "./auth";
import {
  STATUS_META,
  type AppointmentStatus,
  isAppointmentStatus,
} from "./format";
import { endOfMonth, fromDateInput, startOfMonth, toDateInput } from "./time";

export type ReportStatus = AppointmentStatus | "all";

export type ReportFilters = {
  de: string;
  ate: string;
  patientId: string;
  serviceTypeId: string;
  status: ReportStatus;
};

function pickString(input: Record<string, string | string[] | undefined>, key: string): string {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

export function parseReportFilters(
  input: Record<string, string | string[] | undefined>,
): ReportFilters {
  const fallbackFrom = toDateInput(startOfMonth());
  const fallbackTo = toDateInput(endOfMonth());

  let de = /^\d{4}-\d{2}-\d{2}$/.test(pickString(input, "de"))
    ? pickString(input, "de")
    : fallbackFrom;
  let ate = /^\d{4}-\d{2}-\d{2}$/.test(pickString(input, "ate"))
    ? pickString(input, "ate")
    : fallbackTo;

  if (de > ate) {
    const swap = de;
    de = ate;
    ate = swap;
  }

  const statusRaw = pickString(input, "status");
  const status: ReportStatus =
    statusRaw === "all" ? "all" : isAppointmentStatus(statusRaw) ? statusRaw : "completed";

  return {
    de,
    ate,
    patientId: pickString(input, "paciente"),
    serviceTypeId: pickString(input, "tipo"),
    status,
  };
}

export type ReportRow = {
  serviceTypeId: string;
  name: string;
  color: string;
  count: number;
  totalCents: number;
  averageCents: number;
};

export type Report = {
  rows: ReportRow[];
  statusCounts: Record<string, number>;
  totalCount: number;
  totalCents: number;
  averageCents: number;
  from: Date;
  to: Date;
  filters: ReportFilters;
  patientName: string | null;
  serviceTypeName: string | null;
  statusLabel: string;
};

export async function buildReport(filters: ReportFilters): Promise<Report> {
  const db = await getDb();
  const from = fromDateInput(filters.de);
  const to = fromDateInput(filters.ate, true);

  const scope = [gte(appointments.scheduledAt, from), lte(appointments.scheduledAt, to)];

  if (filters.patientId && isUuid(filters.patientId)) {
    scope.push(eq(appointments.patientId, filters.patientId));
  }
  if (filters.serviceTypeId && isUuid(filters.serviceTypeId)) {
    scope.push(eq(appointments.serviceTypeId, filters.serviceTypeId));
  }

  const statusRows = await db
    .select({ status: appointments.status, count: appointments.id })
    .from(appointments)
    .where(and(...scope));

  const statusCounts: Record<string, number> = {};
  for (const row of statusRows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const conditions = [...scope];
  if (filters.status !== "all") {
    conditions.push(eq(appointments.status, filters.status));
  }

  const items = await db
    .select({
      serviceTypeId: serviceTypes.id,
      name: serviceTypes.name,
      color: serviceTypes.color,
      priceCents: appointments.priceCents,
    })
    .from(appointments)
    .innerJoin(serviceTypes, eq(appointments.serviceTypeId, serviceTypes.id))
    .where(and(...conditions));

  const groups = new Map<string, ReportRow>();

  for (const item of items) {
    const current = groups.get(item.serviceTypeId) ?? {
      serviceTypeId: item.serviceTypeId,
      name: item.name,
      color: item.color,
      count: 0,
      totalCents: 0,
      averageCents: 0,
    };
    current.count += 1;
    current.totalCents += item.priceCents;
    groups.set(item.serviceTypeId, current);
  }

  const rows = [...groups.values()]
    .map((row) => ({
      ...row,
      averageCents: row.count > 0 ? Math.round(row.totalCents / row.count) : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents || a.name.localeCompare(b.name, "pt-BR"));

  const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
  const totalCents = rows.reduce((sum, row) => sum + row.totalCents, 0);

  let patientName: string | null = null;
  if (filters.patientId && isUuid(filters.patientId)) {
    const [patient] = await db
      .select({ name: patients.name })
      .from(patients)
      .where(eq(patients.id, filters.patientId))
      .limit(1);
    patientName = patient?.name ?? null;
  }

  let serviceTypeName: string | null = null;
  if (filters.serviceTypeId && isUuid(filters.serviceTypeId)) {
    const [type] = await db
      .select({ name: serviceTypes.name })
      .from(serviceTypes)
      .where(eq(serviceTypes.id, filters.serviceTypeId))
      .limit(1);
    serviceTypeName = type?.name ?? null;
  }

  const statusLabel =
    filters.status === "all" ? "Todos os status" : STATUS_META[filters.status].label;

  return {
    rows,
    statusCounts,
    totalCount,
    totalCents,
    averageCents: totalCount > 0 ? Math.round(totalCents / totalCount) : 0,
    from,
    to,
    filters,
    patientName,
    serviceTypeName,
    statusLabel,
  };
}

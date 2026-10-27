import { and, asc, desc, eq, getTableColumns, gte, ilike, lte, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { appointments, patients, serviceTypes, settings } from "../db/schema";
import type { AppointmentStatus } from "./format";
import { isUuid } from "./auth";
import {
  addDaysToDateOnly,
  endOfDay,
  endOfMonth,
  formatDate,
  startOfDay,
  startOfMonth,
  todayInput,
} from "./time";

export type AppointmentListItem = {
  id: string;
  scheduledAt: Date;
  status: string;
  priceCents: number;
  notes: string | null;
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceTypeId: string;
  serviceTypeName: string;
  serviceTypeColor: string;
};

export type AppointmentFilters = {
  from?: Date;
  to?: Date;
  patientId?: string;
  serviceTypeId?: string;
  status?: AppointmentStatus | "all";
  order?: "asc" | "desc";
  limit?: number;
};

export async function listAppointments(filters: AppointmentFilters = {}): Promise<
  AppointmentListItem[]
> {
  const db = await getDb();
  const conditions = [];

  if (filters.from) conditions.push(gte(appointments.scheduledAt, filters.from));
  if (filters.to) conditions.push(lte(appointments.scheduledAt, filters.to));
  if (filters.patientId && isUuid(filters.patientId)) {
    conditions.push(eq(appointments.patientId, filters.patientId));
  }
  if (filters.serviceTypeId && isUuid(filters.serviceTypeId)) {
    conditions.push(eq(appointments.serviceTypeId, filters.serviceTypeId));
  }
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(appointments.status, filters.status));
  }

  const rows = await db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      priceCents: appointments.priceCents,
      notes: appointments.notes,
      patientId: patients.id,
      patientName: patients.name,
      patientPhone: patients.phone,
      serviceTypeId: serviceTypes.id,
      serviceTypeName: serviceTypes.name,
      serviceTypeColor: serviceTypes.color,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(serviceTypes, eq(appointments.serviceTypeId, serviceTypes.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      filters.order === "asc" ? asc(appointments.scheduledAt) : desc(appointments.scheduledAt),
    )
    .limit(filters.limit ?? 400);

  return rows;
}

export type PatientRow = typeof patients.$inferSelect & {
  appointmentCount: number;
  lastVisit: string | null;
};

export type PatientFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

export async function listPatients(filters: PatientFilters = {}): Promise<PatientRow[]> {
  const db = await getDb();
  const conditions = [];

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(ilike(patients.name, term), ilike(patients.phone, term)));
  }
  if (filters.status === "active") conditions.push(eq(patients.active, true));
  if (filters.status === "inactive") conditions.push(eq(patients.active, false));

  const rows = await db
    .select({
      ...getTableColumns(patients),
      appointmentCount: sql<number>`(
        select count(*)::int from appointments
        where appointments.patient_id = patients.id
      )`,
      lastVisit: sql<string | null>`(
        select to_char(
          max(appointments.scheduled_at) at time zone 'America/Sao_Paulo',
          'YYYY-MM-DD'
        )
        from appointments
        where appointments.patient_id = patients.id
          and appointments.status = 'completed'
      )`,
    })
    .from(patients)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(patients.name));

  return rows;
}

export async function getPatient(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return patient ?? null;
}

export async function getPatientDetail(id: string) {
  const patient = await getPatient(id);
  if (!patient) return null;

  const history = await listAppointments({ patientId: id, order: "desc", limit: 400 });
  const completed = history.filter((item) => item.status === "completed");

  const groups = new Map<
    string,
    { id: string; name: string; color: string; count: number; totalCents: number }
  >();

  for (const item of completed) {
    const current = groups.get(item.serviceTypeId) ?? {
      id: item.serviceTypeId,
      name: item.serviceTypeName,
      color: item.serviceTypeColor,
      count: 0,
      totalCents: 0,
    };
    current.count += 1;
    current.totalCents += item.priceCents;
    groups.set(item.serviceTypeId, current);
  }

  const byType = [...groups.values()].sort((a, b) => b.totalCents - a.totalCents);

  return {
    patient,
    history,
    totalCompleted: completed.length,
    totalValue: completed.reduce((sum, item) => sum + item.priceCents, 0),
    byType,
  };
}

export type ServiceTypeRow = typeof serviceTypes.$inferSelect & {
  appointmentCount: number;
  completedCount: number;
};

export async function listServiceTypes(includeInactive = true): Promise<ServiceTypeRow[]> {
  const db = await getDb();

  const rows = await db
    .select({
      ...getTableColumns(serviceTypes),
      appointmentCount: sql<number>`(
        select count(*)::int from appointments
        where appointments.service_type_id = service_types.id
      )`,
      completedCount: sql<number>`(
        select count(*)::int from appointments
        where appointments.service_type_id = service_types.id
          and appointments.status = 'completed'
      )`,
    })
    .from(serviceTypes)
    .where(includeInactive ? undefined : eq(serviceTypes.active, true))
    .orderBy(asc(serviceTypes.name));

  return rows;
}

export async function getServiceType(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [row] = await db.select().from(serviceTypes).where(eq(serviceTypes.id, id)).limit(1);
  return row ?? null;
}

export async function getAppointment(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [row] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return row ?? null;
}

export async function getSettings() {
  const db = await getDb();
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return (
    row ?? {
      id: 1,
      clinicName: "Clínica Movimento",
      professionalName: "",
      phone: null,
      address: null,
      updatedAt: new Date(),
    }
  );
}

export async function getDashboard() {
  const db = await getDb();
  const now = new Date();

  const monthFrom = startOfMonth(now);
  const monthTo = endOfMonth(now);

  const statusRows = await db
    .select({
      status: appointments.status,
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${appointments.priceCents}), 0)::int`,
    })
    .from(appointments)
    .where(and(gte(appointments.scheduledAt, monthFrom), lte(appointments.scheduledAt, monthTo)))
    .groupBy(appointments.status);

  const statusMap: Record<string, { count: number; total: number }> = {};
  for (const row of statusRows) {
    statusMap[row.status] = { count: row.count, total: row.total };
  }

  const today = await listAppointments({
    from: startOfDay(now),
    to: endOfDay(now),
    order: "asc",
  });

  const tomorrowFrom = startOfDay(
    new Date(`${addDaysToDateOnly(todayInput(), 1)}T12:00:00`),
  );
  const upcoming = await listAppointments({
    from: tomorrowFrom,
    status: "scheduled",
    order: "asc",
    limit: 5,
  });

  const typeRows = await db
    .select({
      id: serviceTypes.id,
      name: serviceTypes.name,
      color: serviceTypes.color,
      count: sql<number>`count(*)::int`,
      totalCents: sql<number>`coalesce(sum(${appointments.priceCents}), 0)::int`,
    })
    .from(appointments)
    .innerJoin(serviceTypes, eq(appointments.serviceTypeId, serviceTypes.id))
    .where(
      and(
        gte(appointments.scheduledAt, monthFrom),
        lte(appointments.scheduledAt, monthTo),
        eq(appointments.status, "completed"),
      ),
    )
    .groupBy(serviceTypes.id)
    .orderBy(desc(sql`coalesce(sum(${appointments.priceCents}), 0)`))
    .limit(6);

  const completed = statusMap.completed ?? { count: 0, total: 0 };
  const scheduled = statusMap.scheduled ?? { count: 0, total: 0 };
  const noShow = statusMap.no_show ?? { count: 0, total: 0 };
  const canceled = statusMap.canceled ?? { count: 0, total: 0 };

  return {
    today,
    upcoming,
    byType: typeRows,
    totals: {
      completedCount: completed.count,
      completedValue: completed.total,
      scheduledCount: scheduled.count,
      noShowCount: noShow.count,
      canceledCount: canceled.count,
      totalMonthCount: statusRows.reduce((sum, row) => sum + row.count, 0),
    },
    monthLabel: formatDate(now, "MMMM 'de' yyyy"),
  };
}

export async function getWeekAppointments(startDate: string) {
  const from = startOfDay(new Date(`${startDate}T12:00:00`));
  const to = endOfDay(new Date(`${addDaysToDateOnly(startDate, 6)}T12:00:00`));
  return listAppointments({ from, to, order: "asc", limit: 500 });
}

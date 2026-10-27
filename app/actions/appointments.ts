"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { appointments, patients, serviceTypes } from "@/db/schema";
import { isUuid, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isAppointmentStatus, parseMoneyToCents } from "@/lib/format";
import { fromDateTimeInput } from "@/lib/time";
import { formError, type FormState } from "@/lib/utils";
import { appointmentSchema, fieldErrors } from "@/lib/validation";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function revalidateAgenda() {
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/atendimentos");
  revalidatePath("/relatorios");
  revalidatePath("/pacientes");
}

export async function saveAppointmentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const id = text(formData, "id");
  const priceCents = parseMoneyToCents(text(formData, "price"));

  if (priceCents === null) {
    return formError("Informe um valor válido para o atendimento.", {
      price: "Valor inválido. Use, por exemplo, 160,00.",
    });
  }

  const parsed = appointmentSchema.safeParse({
    patientId: text(formData, "patientId"),
    serviceTypeId: text(formData, "serviceTypeId"),
    scheduledAt: text(formData, "scheduledAt"),
    priceCents,
    status: text(formData, "status"),
    notes: text(formData, "notes"),
  });

  if (!parsed.success) {
    return formError("Confira os campos destacados.", fieldErrors(parsed.error));
  }

  if (!isUuid(parsed.data.patientId)) {
    return formError("Paciente inválido.", { patientId: "Selecione um paciente." });
  }

  if (!isUuid(parsed.data.serviceTypeId)) {
    return formError("Tipo de atendimento inválido.", {
      serviceTypeId: "Selecione um tipo de atendimento.",
    });
  }

  const db = await getDb();
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, parsed.data.patientId))
    .limit(1);
  if (!patient) {
    return formError("Paciente não encontrado.", { patientId: "Selecione um paciente." });
  }

  const [type] = await db
    .select({ id: serviceTypes.id })
    .from(serviceTypes)
    .where(eq(serviceTypes.id, parsed.data.serviceTypeId))
    .limit(1);
  if (!type) {
    return formError("Tipo de atendimento não encontrado.", {
      serviceTypeId: "Selecione um tipo de atendimento.",
    });
  }

  const scheduledAt = fromDateTimeInput(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    return formError("Data e horário inválidos.", { scheduledAt: "Informe uma data válida." });
  }

  const values = {
    patientId: parsed.data.patientId,
    serviceTypeId: parsed.data.serviceTypeId,
    scheduledAt,
    status: parsed.data.status,
    priceCents: parsed.data.priceCents,
    notes: parsed.data.notes || null,
    updatedAt: new Date(),
  };

  if (id && isUuid(id)) {
    await db.update(appointments).set(values).where(eq(appointments.id, id));
  } else {
    await db.insert(appointments).values(values);
  }

  revalidateAgenda();
  revalidatePath(`/pacientes/${parsed.data.patientId}`);
  redirect("/atendimentos?salvo=1");
}

export async function setAppointmentStatusAction(formData: FormData): Promise<void> {
  await requireUser();

  const id = text(formData, "id");
  const status = text(formData, "status");
  const back = text(formData, "back");

  if (!isUuid(id) || !isAppointmentStatus(status)) return;

  const db = await getDb();
  await db
    .update(appointments)
    .set({ status, updatedAt: new Date() })
    .where(eq(appointments.id, id));

  revalidateAgenda();
  if (back.startsWith("/")) redirect(back);
}

export async function deleteAppointmentAction(formData: FormData): Promise<void> {
  await requireUser();

  const id = text(formData, "id");
  const patientId = text(formData, "patientId");

  if (!isUuid(id)) return;

  const db = await getDb();
  await db.delete(appointments).where(eq(appointments.id, id));

  revalidateAgenda();
  if (isUuid(patientId)) revalidatePath(`/pacientes/${patientId}`);
  redirect("/atendimentos?salvo=excluido");
}

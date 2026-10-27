"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { appointments, patients } from "@/db/schema";
import { isUuid, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { fieldErrors, patientSchema } from "@/lib/validation";
import { formError, type FormState } from "@/lib/utils";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function savePatientAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const id = text(formData, "id");
  const parsed = patientSchema.safeParse({
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    birthDate: text(formData, "birthDate"),
    cpf: text(formData, "cpf"),
    address: text(formData, "address"),
    notes: text(formData, "notes"),
  });

  if (!parsed.success) {
    return formError("Confira os campos destacados.", fieldErrors(parsed.error));
  }

  const db = await getDb();
  const values = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    birthDate: parsed.data.birthDate || null,
    cpf: parsed.data.cpf || null,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
    updatedAt: new Date(),
  };

  let patientId = id;

  if (id && isUuid(id)) {
    await db.update(patients).set(values).where(eq(patients.id, id));
  } else {
    const [created] = await db
      .insert(patients)
      .values(values)
      .returning({ id: patients.id });
    patientId = created.id;
  }

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${patientId}`);
  redirect(`/pacientes/${patientId}?salvo=1`);
}

export async function togglePatientAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!isUuid(id)) return;

  const db = await getDb();
  const [patient] = await db
    .select({ active: patients.active })
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1);

  if (!patient) return;

  await db
    .update(patients)
    .set({ active: !patient.active, updatedAt: new Date() })
    .where(eq(patients.id, id));

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
}

export async function deletePatientAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!isUuid(id)) return;

  const db = await getDb();
  const [usage] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(eq(appointments.patientId, id));

  if ((usage?.count ?? 0) > 0) {
    redirect(`/pacientes/${id}?erro=vinculado`);
  }

  await db.delete(patients).where(eq(patients.id, id));
  revalidatePath("/pacientes");
  redirect("/pacientes?salvo=excluido");
}

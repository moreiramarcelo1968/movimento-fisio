"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { appointments, serviceTypes } from "@/db/schema";
import { isUuid, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { parseMoneyToCents } from "@/lib/format";
import { isUniqueViolation, formError, type FormState } from "@/lib/utils";
import { fieldErrors, serviceTypeSchema } from "@/lib/validation";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function saveServiceTypeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const id = text(formData, "id");
  const priceCents = parseMoneyToCents(text(formData, "price"));

  if (priceCents === null) {
    return formError("Informe um valor válido para o atendimento.", {
      price: "Valor inválido. Use, por exemplo, 150,00.",
    });
  }

  const parsed = serviceTypeSchema.safeParse({
    name: text(formData, "name"),
    description: text(formData, "description"),
    durationMin: text(formData, "durationMin"),
    priceCents,
    color: text(formData, "color") || "teal",
    active: text(formData, "active") === "on",
  });

  if (!parsed.success) {
    return formError("Confira os campos destacados.", fieldErrors(parsed.error));
  }

  const db = await getDb();
  const values = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    durationMin: parsed.data.durationMin,
    priceCents: parsed.data.priceCents,
    color: parsed.data.color,
    active: parsed.data.active,
    updatedAt: new Date(),
  };

  try {
    if (id && isUuid(id)) {
      await db.update(serviceTypes).set(values).where(eq(serviceTypes.id, id));
    } else {
      await db.insert(serviceTypes).values(values);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return formError("Já existe um tipo de atendimento com este nome.", {
        name: "Use um nome diferente.",
      });
    }
    throw error;
  }

  revalidatePath("/tipos-atendimento");
  revalidatePath("/atendimentos");
  revalidatePath("/relatorios");
  redirect("/tipos-atendimento?salvo=1");
}

export async function toggleServiceTypeAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!isUuid(id)) return;

  const db = await getDb();
  const [type] = await db
    .select({ active: serviceTypes.active })
    .from(serviceTypes)
    .where(eq(serviceTypes.id, id))
    .limit(1);

  if (!type) return;

  await db
    .update(serviceTypes)
    .set({ active: !type.active, updatedAt: new Date() })
    .where(eq(serviceTypes.id, id));

  revalidatePath("/tipos-atendimento");
  revalidatePath("/atendimentos");
}

export async function deleteServiceTypeAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!isUuid(id)) return;

  const db = await getDb();
  const [usage] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(eq(appointments.serviceTypeId, id));

  if ((usage?.count ?? 0) > 0) {
    redirect("/tipos-atendimento?erro=vinculado");
  }

  await db.delete(serviceTypes).where(eq(serviceTypes.id, id));
  revalidatePath("/tipos-atendimento");
  redirect("/tipos-atendimento?salvo=excluido");
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { settings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formError, type FormState } from "@/lib/utils";
import { clinicSchema, fieldErrors } from "@/lib/validation";

export async function saveClinicAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const parsed = clinicSchema.safeParse({
    clinicName: String(formData.get("clinicName") ?? ""),
    professionalName: String(formData.get("professionalName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
  });

  if (!parsed.success) {
    return formError("Confira os dados da clínica.", fieldErrors(parsed.error));
  }

  const db = await getDb();

  await db
    .update(settings)
    .set({
      clinicName: parsed.data.clinicName,
      professionalName: parsed.data.professionalName,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));

  revalidatePath("/", "layout");
  revalidatePath("/relatorios");

  return { status: "success", message: "Dados da clínica salvos." };
}

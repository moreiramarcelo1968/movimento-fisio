"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import {
  clearAttempts,
  createSession,
  destroySession,
  hashPassword,
  registerFailedAttempt,
  remainingAttempts,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isUniqueViolation } from "@/lib/utils";
import { fieldErrors, loginSchema, passwordSchema, profileSchema } from "@/lib/validation";
import { formError, type FormState } from "@/lib/utils";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return formError("Confira os campos para entrar.", fieldErrors(parsed.error));
  }

  const { email, password } = parsed.data;

  if (remainingAttempts(email) <= 0) {
    return formError("Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.");
  }

  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    registerFailedAttempt(email);
    return formError("E-mail ou senha não conferem.");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    registerFailedAttempt(email);
    return formError("E-mail ou senha não conferem.");
  }

  clearAttempts(email);
  await createSession(user.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const currentUser = await requireUser();
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return formError("Confira os dados do perfil.", fieldErrors(parsed.error));
  }

  const db = await getDb();

  try {
    await db
      .update(users)
      .set({ name: parsed.data.name, email: parsed.data.email, updatedAt: new Date() })
      .where(eq(users.id, currentUser.id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return formError("Este e-mail já está em uso.", { email: "E-mail já cadastrado." });
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Perfil atualizado." };
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const currentUser = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return formError("Confira os campos de senha.", fieldErrors(parsed.error));
  }

  const db = await getDb();
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!user) return formError("Usuário não encontrado.");

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return formError("A senha atual não confere.", { currentPassword: "Senha incorreta." });
  }

  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data.newPassword),
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id));

  return { status: "success", message: "Senha alterada." };
}

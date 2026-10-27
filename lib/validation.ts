import { z } from "zod";
import { APPOINTMENT_STATUSES, SERVICE_COLORS } from "./format";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export const patientSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo.").max(120, "Nome muito longo."),
  phone: z.string().trim().min(8, "Informe um telefone para contato.").max(30),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((value) => value === "" || emailPattern.test(value), "E-mail inválido."),
  birthDate: z
    .string()
    .trim()
    .refine((value) => value === "" || datePattern.test(value), "Data de nascimento inválida."),
  cpf: z.string().trim().max(20),
  address: z.string().trim().max(240),
  notes: z.string().trim().max(2000),
});

export const serviceTypeSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome do atendimento.").max(80, "Nome muito longo."),
  description: z.string().trim().max(400),
  durationMin: z.coerce
    .number()
    .int("Duração inválida.")
    .min(5, "Mínimo de 5 minutos.")
    .max(480, "Máximo de 8 horas."),
  priceCents: z.number().int("Valor inválido.").min(0, "O valor não pode ser negativo.").max(10000000),
  color: z.enum(Object.keys(SERVICE_COLORS) as [string, ...string[]]),
  active: z.boolean(),
});

export const appointmentSchema = z.object({
  patientId: z.string().trim().min(1, "Selecione o paciente."),
  serviceTypeId: z.string().trim().min(1, "Selecione o tipo de atendimento."),
  scheduledAt: z
    .string()
    .trim()
    .regex(dateTimePattern, "Informe a data e o horário do atendimento."),
  priceCents: z.number().int("Valor inválido.").min(0, "O valor não pode ser negativo.").max(10000000),
  status: z.enum(APPOINTMENT_STATUSES),
  notes: z.string().trim().max(2000),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().refine((value) => emailPattern.test(value), "E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export const clinicSchema = z.object({
  clinicName: z.string().trim().min(2, "Informe o nome da clínica.").max(120),
  professionalName: z.string().trim().max(120),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(240),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome.").max(120),
  email: z.string().trim().toLowerCase().refine((value) => emailPattern.test(value), "E-mail inválido."),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z.string().min(8, "Use pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

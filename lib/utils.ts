import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
};

export const idleFormState: FormState = { status: "idle" };

export function formError(message: string, errors?: Record<string, string>): FormState {
  return { status: "error", message, errors };
}

export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; cause?: unknown };
  if (candidate.code === "23505") return true;
  if (typeof candidate.message === "string" && candidate.message.includes("duplicate key")) {
    return true;
  }
  if (candidate.cause && typeof candidate.cause === "object") {
    const cause = candidate.cause as { code?: string; message?: string };
    return cause.code === "23505" || Boolean(cause.message?.includes("duplicate key"));
  }
  return false;
}

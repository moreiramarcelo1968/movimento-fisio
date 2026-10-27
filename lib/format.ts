export const APPOINTMENT_STATUSES = ["scheduled", "completed", "no_show", "canceled"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; chip: string; dot: string; hint: string }
> = {
  scheduled: {
    label: "Agendado",
    chip: "bg-marigold-soft text-[#7d5a12]",
    dot: "bg-marigold",
    hint: "Ainda vai acontecer",
  },
  completed: {
    label: "Realizado",
    chip: "bg-pine-soft text-pine-deep",
    dot: "bg-pine",
    hint: "Compareceu e foi atendido",
  },
  no_show: {
    label: "Faltou",
    chip: "bg-rust-soft text-rust",
    dot: "bg-rust",
    hint: "Não compareceu",
  },
  canceled: {
    label: "Cancelado",
    chip: "bg-[#eceeec] text-ink-soft",
    dot: "bg-[#8b9792]",
    hint: "Cancelado antes do horário",
  },
};

export function isAppointmentStatus(value: string): value is AppointmentStatus {
  return (APPOINTMENT_STATUSES as readonly string[]).includes(value);
}

export const SERVICE_COLORS = {
  teal: { hex: "#0D4F47", label: "Verde profundo" },
  sage: { hex: "#6E9075", label: "Sálvia" },
  amber: { hex: "#D9A441", label: "Mostarda" },
  clay: { hex: "#B4644A", label: "Terracota" },
  sky: { hex: "#4A7FA3", label: "Azul" },
} as const;

export type ServiceColor = keyof typeof SERVICE_COLORS;

export const SERVICE_COLOR_OPTIONS = Object.entries(SERVICE_COLORS).map(([value, meta]) => ({
  value: value as ServiceColor,
  ...meta,
}));

export function serviceColorHex(color: string): string {
  return SERVICE_COLORS[color as ServiceColor]?.hex ?? SERVICE_COLORS.teal.hex;
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatCentsInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function parseMoneyToCents(input: string): number | null {
  let value = input.replace(/[^\d,.-]/g, "").trim();
  if (!value) return null;

  if (value.includes(",")) {
    value = value.replace(/\./g, "").replace(",", ".");
  } else {
    const dots = value.split(".");
    if (dots.length === 2 && dots[1].length === 3) {
      value = dots.join("");
    } else if (dots.length > 2) {
      value = dots.join("");
    }
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return Math.round(parsed * 100);
}

export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 2 || part === name.trim().split(/\s+/)[0]);

  const first = parts[0]?.[0] ?? name[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function ageFromBirthDate(value: string | null | undefined): number | null {
  if (!value) return null;
  const birth = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

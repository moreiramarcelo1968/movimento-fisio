import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const TZ = "America/Sao_Paulo";

export function nowTz(): Date {
  return toZonedTime(new Date(), TZ);
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateOnly(value: string, amount: number): string {
  const date = parseDateOnly(value);
  date.setDate(date.getDate() + amount);
  return toDateOnlyString(date);
}

export function todayInput(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
}

export function startOfDay(date: Date = new Date()): Date {
  return fromZonedTime(`${formatInTimeZone(date, TZ, "yyyy-MM-dd")}T00:00:00`, TZ);
}

export function endOfDay(date: Date = new Date()): Date {
  return fromZonedTime(`${formatInTimeZone(date, TZ, "yyyy-MM-dd")}T23:59:59.999`, TZ);
}

export function startOfMonth(date: Date = new Date()): Date {
  return fromZonedTime(`${formatInTimeZone(date, TZ, "yyyy-MM")}-01T00:00:00`, TZ);
}

export function endOfMonth(date: Date = new Date()): Date {
  const reference = toZonedTime(date, TZ);
  const lastDay = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
  const month = formatInTimeZone(date, TZ, "yyyy-MM");
  return fromZonedTime(
    `${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999`,
    TZ,
  );
}

export function fromDateInput(value: string, end = false): Date {
  return fromZonedTime(`${value}T${end ? "23:59:59.999" : "00:00:00"}`, TZ);
}

export function fromDateTimeInput(value: string): Date {
  const normalized = value.length === 16 ? `${value}:00` : value;
  return fromZonedTime(normalized, TZ);
}

export function toDateTimeInput(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd'T'HH:mm");
}

export function toDateInput(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd");
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy"): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(value, TZ, pattern, { locale: ptBR });
}

export function formatTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(value, TZ, "HH:mm");
}

export function formatLongDate(date: Date = new Date()): string {
  return formatInTimeZone(date, TZ, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function capitalizeFirst(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function formatMonthYear(date: Date = new Date()): string {
  return formatInTimeZone(date, TZ, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatWeekdayShort(date: Date): string {
  return formatInTimeZone(date, TZ, "EEE", { locale: ptBR }).replace(".", "");
}

export function greeting(date: Date = new Date()): string {
  const hour = Number(formatInTimeZone(date, TZ, "H"));
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function weekStart(anchor?: string): string {
  const base = parseDateOnly(anchor || todayInput());
  const weekday = base.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  base.setDate(base.getDate() + diff);
  return toDateOnlyString(base);
}

export type WeekDay = {
  date: string;
  weekday: string;
  dayNumber: string;
  month: string;
  isToday: boolean;
};

export function weekDays(start: string): WeekDay[] {
  const today = todayInput();
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToDateOnly(start, index);
    const parsed = parseDateOnly(date);
    return {
      date,
      weekday: format(parsed, "EEEE", { locale: ptBR })
        .replace("-feira", "")
        .replace(/^./, (letter) => letter.toUpperCase()),
      dayNumber: format(parsed, "dd"),
      month: format(parsed, "MMM", { locale: ptBR }).replace(".", ""),
      isToday: date === today,
    };
  });
}

export function nextSlotInput(): string {
  const zoned = nowTz();
  zoned.setSeconds(0, 0);
  const minutes = zoned.getMinutes();
  const next = minutes < 30 ? 30 : 60;
  zoned.setMinutes(next);
  return format(zoned, "yyyy-MM-dd'T'HH:mm");
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

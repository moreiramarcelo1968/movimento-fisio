import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatBRL,
  pluralize,
  STATUS_META,
  type AppointmentStatus,
} from "@/lib/format";
import { getWeekAppointments } from "@/lib/queries";
import {
  addDaysToDateOnly,
  formatDate,
  formatTime,
  fromDateInput,
  toDateInput,
  weekDays,
  weekStart,
} from "@/lib/time";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Agenda" };

type SearchParams = Promise<{ semana?: string }>;

export default async function AgendaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const start = weekStart(/^\d{4}-\d{2}-\d{2}$/.test(params.semana ?? "") ? params.semana : undefined);
  const days = weekDays(start);
  const items = await getWeekAppointments(start);

  const byDay = new Map<string, typeof items>();
  for (const day of days) {
    byDay.set(
      day.date,
      items.filter((item) => toDateInput(item.scheduledAt) === day.date),
    );
  }

  const completed = items.filter((item) => item.status === "completed");
  const completedValue = completed.reduce((total, item) => total + item.priceCents, 0);
  const weekLabel = `${formatDate(fromDateInput(start), "d 'de' MMM")} a ${formatDate(
    fromDateInput(addDaysToDateOnly(start, 6)),
    "d 'de' MMM",
  )}`;
  const isCurrentWeek = start === weekStart();

  return (
    <div>
      <PageHeader
        title="Agenda"
        description={`Semana de ${weekLabel} · ${items.length} ${pluralize(items.length, "atendimento", "atendimentos")} · ${formatBRL(completedValue)} realizados`}
        actions={
          <div className="flex items-center gap-1">
            <ButtonLink
              href={`/agenda?semana=${addDaysToDateOnly(start, -7)}`}
              variant="secondary"
              size="icon"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/agenda" variant="secondary" size="sm">
              Hoje
            </ButtonLink>
            <ButtonLink
              href={`/agenda?semana=${addDaysToDateOnly(start, 7)}`}
              variant="secondary"
              size="icon"
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-surface">
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="Semana sem atendimentos"
            description="Nada marcado entre segunda e domingo. Você pode agendar uma nova sessão agora."
            action={{ href: "/atendimentos/novo", label: "Novo atendimento" }}
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[18px] border border-line bg-surface lg:grid lg:grid-cols-7">
            {days.map((day) => {
              const list = byDay.get(day.date) ?? [];
              return (
                <div
                  key={day.date}
                  className={cn(
                    "min-h-[340px] border-r border-line last:border-r-0",
                    day.isToday && "bg-pine-soft/25",
                  )}
                >
                  <div className="border-b border-line px-3 py-2.5">
                    <p
                      className={cn(
                        "text-[11px]",
                        day.isToday ? "font-medium text-pine" : "text-ink-soft",
                      )}
                    >
                      {day.weekday}
                    </p>
                    <p
                      className={cn(
                        "font-display text-[19px] leading-tight font-semibold tabular-nums",
                        day.isToday ? "text-pine" : "text-ink",
                      )}
                    >
                      {day.dayNumber}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-2">
                    {list.length === 0 ? (
                      <p className="py-4 text-center text-[11px] text-ink-soft/60">
                        {day.isToday ? "livre" : "—"}
                      </p>
                    ) : (
                      list.map((item) => {
                        const meta =
                          STATUS_META[item.status as AppointmentStatus] ?? STATUS_META.scheduled;
                        return (
                          <Link
                            key={item.id}
                            href={`/atendimentos/${item.id}`}
                            className="block rounded-lg border border-line bg-surface px-2 py-1.5 transition hover:border-pine/40 hover:bg-pine-soft/20"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                              <span className="text-[10.5px] font-semibold text-ink-soft tabular-nums">
                                {formatTime(item.scheduledAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[11.5px] font-medium text-ink">
                              {item.patientName}
                            </p>
                            <p className="truncate text-[10px] text-ink-soft">
                              {item.serviceTypeName}
                            </p>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 lg:hidden">
            {days.map((day) => {
              const list = byDay.get(day.date) ?? [];
              return (
                <div
                  key={day.date}
                  className="overflow-hidden rounded-[18px] border border-line bg-surface"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between border-b border-line px-4 py-2.5",
                      day.isToday && "bg-pine-soft/40",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[12.5px] font-semibold",
                        day.isToday ? "text-pine" : "text-ink",
                      )}
                    >
                      {day.weekday}, {day.dayNumber} de {day.month}
                    </p>
                    <span className="text-[11px] text-ink-soft">
                      {list.length} {pluralize(list.length, "sessão", "sessões")}
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <p className="px-4 py-3 text-[12px] text-ink-soft/70">Sem atendimentos.</p>
                  ) : (
                    <ul className="divide-y divide-line/70">
                      {list.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/atendimentos/${item.id}`}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="w-10 shrink-0 text-[12px] font-semibold text-ink-soft tabular-nums">
                                {formatTime(item.scheduledAt)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[13.5px] font-medium text-ink">
                                  {item.patientName}
                                </p>
                                <p className="truncate text-[11.5px] text-ink-soft">
                                  {item.serviceTypeName}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={item.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {!isCurrentWeek ? (
            <p className="mt-4 text-center text-[12px] text-ink-soft">
              <Link href="/agenda" className="font-medium text-pine hover:underline">
                Voltar para a semana atual
              </Link>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

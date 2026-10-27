import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  ClipboardCheck,
  Clock,
  Users,
  Wallet,
  UserX,
} from "lucide-react";
import { setAppointmentStatusAction } from "@/app/actions/appointments";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import {
  formatBRL,
  firstName,
  pluralize,
  serviceColorHex,
  STATUS_META,
  type AppointmentStatus,
} from "@/lib/format";
import { getDashboard } from "@/lib/queries";
import { formatDate, formatLongDate, formatTime, greeting, capitalizeFirst } from "@/lib/time";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Painel" };

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-surface px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center gap-1.5 text-ink-soft">
        {icon}
        <p className="text-[11.5px] font-medium">{label}</p>
      </div>
      <p className="mt-2 font-display text-[25px] leading-none font-semibold tracking-tight text-ink tabular-nums sm:text-[28px]">
        {value}
      </p>
      <p className="mt-1.5 text-[11.5px] text-ink-soft">{hint}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboard();

  const todayCompleted = data.today.filter((item) => item.status === "completed").length;
  const ticket = data.totals.completedCount
    ? Math.round(data.totals.completedValue / data.totals.completedCount)
    : 0;
  const maxTypeValue = Math.max(...data.byType.map((item) => item.totalCents), 1);
  const dateLabel = capitalizeFirst(formatLongDate());

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${firstName(user.name)}`}
        description={
          <span>
            {dateLabel} · {data.totals.totalMonthCount}{" "}
            {pluralize(data.totals.totalMonthCount, "atendimento no mês", "atendimentos no mês")}
          </span>
        }
        actions={
          <ButtonLink href="/atendimentos/novo">
            <CalendarPlus className="h-4 w-4" />
            Novo atendimento
          </ButtonLink>
        }
      />

      <Panel className="overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          <Stat
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Hoje"
            value={String(data.today.length)}
            hint={`${todayCompleted} ${pluralize(todayCompleted, "realizado", "realizados")}`}
          />
          <Stat
            icon={<ClipboardCheck className="h-3.5 w-3.5" />}
            label="Realizados no mês"
            value={String(data.totals.completedCount)}
            hint={data.monthLabel}
          />
          <Stat
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Faturamento no mês"
            value={formatBRL(data.totals.completedValue)}
            hint={ticket ? `Ticket médio de ${formatBRL(ticket)}` : "Nenhum atendimento ainda"}
          />
          <Stat
            icon={<UserX className="h-3.5 w-3.5" />}
            label="Faltas no mês"
            value={String(data.totals.noShowCount)}
            hint={`${data.totals.canceledCount} ${pluralize(
              data.totals.canceledCount,
              "cancelamento",
              "cancelamentos",
            )}`}
          />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Agenda de hoje"
            description={
              data.today.length === 0
                ? "Nenhum atendimento marcado para hoje."
                : `${data.today.length} ${pluralize(data.today.length, "atendimento", "atendimentos")} · ${todayCompleted} ${pluralize(todayCompleted, "realizado", "realizados")}`
            }
            action={
              <ButtonLink href="/agenda" variant="ghost" size="sm">
                Ver semana
                <ArrowUpRight className="h-3.5 w-3.5" />
              </ButtonLink>
            }
          />

          {data.today.length === 0 ? (
            <EmptyState
              icon={<CalendarPlus className="h-5 w-5" />}
              title="Dia livre por aqui"
              description="Quando houver sessões marcadas, elas aparecem nesta lista em ordem de horário."
              action={{ href: "/atendimentos/novo", label: "Agendar atendimento" }}
            />
          ) : (
            <ol className="px-4 py-2 sm:px-5">
              {data.today.map((item, index) => {
                const meta = STATUS_META[item.status as AppointmentStatus] ?? STATUS_META.scheduled;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex gap-3 sm:gap-4",
                      index !== data.today.length - 1 && "border-b border-line/70",
                    )}
                  >
                    <div className="w-11 shrink-0 py-4 text-right">
                      <p className="text-[13px] font-semibold text-ink tabular-nums">
                        {formatTime(item.scheduledAt)}
                      </p>
                    </div>

                    <div className="relative w-3 shrink-0">
                      <span className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-line" />
                      <span
                        className={cn(
                          "absolute top-[22px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-4 ring-surface",
                          meta.dot,
                        )}
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2 py-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/pacientes/${item.patientId}`}
                            className="truncate text-[14.5px] font-semibold text-ink hover:underline"
                          >
                            {item.patientName}
                          </Link>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">
                          {item.serviceTypeName} · {formatBRL(item.priceCents)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.status === "scheduled" ? (
                          <form action={setAppointmentStatusAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="completed" />
                            <input type="hidden" name="back" value="/" />
                            <button
                              type="submit"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-pine transition hover:border-pine/40 hover:bg-pine-soft"
                              title="Marcar como realizado"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Concluir
                            </button>
                          </form>
                        ) : null}
                        <Link
                          href={`/atendimentos/${item.id}`}
                          aria-label={`Editar atendimento de ${item.patientName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="Por tipo de atendimento"
              description={`Realizados em ${data.monthLabel}`}
              action={
                <ButtonLink href="/relatorios" variant="ghost" size="sm">
                  Relatório
                </ButtonLink>
              }
            />
            {data.byType.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck className="h-5 w-5" />}
                title="Sem atendimentos realizados"
                description="O resumo por tipo aparece assim que as primeiras sessões forem concluídas."
              />
            ) : (
              <div className="space-y-4 px-5 py-4">
                {data.byType.map((item) => {
                  const percent = Math.round((item.totalCents / maxTypeValue) * 100);
                  const hex = serviceColorHex(item.color);
                  return (
                    <div key={item.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="shrink-0 text-[13px] font-semibold text-ink tabular-nums">
                          {formatBRL(item.totalCents)}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: hex }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11.5px] text-ink-soft">
                        {item.count} {pluralize(item.count, "atendimento", "atendimentos")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Próximos"
              description="Agendados a partir de amanhã"
              action={
                <Link
                  href="/atendimentos?status=scheduled"
                  className="text-[12.5px] font-medium text-pine hover:underline"
                >
                  Ver todos
                </Link>
              }
            />
            {data.upcoming.length === 0 ? (
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="Nada agendado"
                description="Os próximos horários confirmados vão aparecer aqui."
              />
            ) : (
              <ul className="divide-y divide-line/70 px-2 py-1">
                {data.upcoming.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/atendimentos/${item.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition hover:bg-paper/70"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-ink">
                          {item.patientName}
                        </p>
                        <p className="truncate text-[11.5px] text-ink-soft">
                          {item.serviceTypeName}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[12.5px] font-semibold text-ink tabular-nums">
                          {formatDate(item.scheduledAt, "dd/MM")}
                        </p>
                        <p className="text-[11.5px] text-ink-soft tabular-nums">
                          {formatTime(item.scheduledAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

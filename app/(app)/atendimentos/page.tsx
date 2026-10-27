import type { Metadata } from "next";
import Link from "next/link";
import { Check, ClipboardList, Pencil, Plus } from "lucide-react";
import { setAppointmentStatusAction } from "@/app/actions/appointments";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, Flash, PageHeader } from "@/components/ui/page";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  APPOINTMENT_STATUSES,
  formatBRL,
  isAppointmentStatus,
  STATUS_META,
  type AppointmentStatus,
} from "@/lib/format";
import { listAppointments, listPatients, listServiceTypes } from "@/lib/queries";
import {
  endOfMonth,
  formatDate,
  formatTime,
  fromDateInput,
  startOfMonth,
  toDateInput,
} from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Atendimentos" };

type SearchParams = Promise<{
  de?: string;
  ate?: string;
  status?: string;
  paciente?: string;
  tipo?: string;
  salvo?: string;
}>;

function isValidDate(value?: string): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  let de = isValidDate(params.de) ? params.de : toDateInput(startOfMonth());
  let ate = isValidDate(params.ate) ? params.ate : toDateInput(endOfMonth());
  if (de > ate) [de, ate] = [ate, de];

  const status: AppointmentStatus | "all" = isAppointmentStatus(params.status ?? "")
    ? (params.status as AppointmentStatus)
    : "all";
  const patientId = params.paciente ?? "";
  const serviceTypeId = params.tipo ?? "";

  const [items, patients, types] = await Promise.all([
    listAppointments({
      from: fromDateInput(de),
      to: fromDateInput(ate, true),
      status,
      patientId,
      serviceTypeId,
    }),
    listPatients({}),
    listServiceTypes(true),
  ]);

  const completed = items.filter((item) => item.status === "completed");
  const completedValue = completed.reduce((total, item) => total + item.priceCents, 0);
  const filtered = Boolean(params.de || params.ate || params.status || params.paciente || params.tipo);

  return (
    <div>
      <PageHeader
        title="Atendimentos"
        description="Todos os registros da clínica, com filtros por período, paciente, tipo e status."
        actions={
          <ButtonLink href="/atendimentos/novo">
            <Plus className="h-4 w-4" />
            Novo atendimento
          </ButtonLink>
        }
      />

      {params.salvo === "1" ? <Flash>Atendimento salvo.</Flash> : null}
      {params.salvo === "excluido" ? <Flash>Atendimento excluído.</Flash> : null}

      <Panel className="mb-5">
        <form method="get" className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[132px_132px_160px_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">De</span>
            <Input type="date" name="de" defaultValue={de} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Até</span>
            <Input type="date" name="ate" defaultValue={ate} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Status</span>
            <Select name="status" defaultValue={status}>
              <option value="all">Todos</option>
              {APPOINTMENT_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {STATUS_META[option].label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Paciente</span>
            <Select name="paciente" defaultValue={patientId}>
              <option value="">Todos</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Tipo</span>
            <Select name="tipo" defaultValue={serviceTypeId}>
              <option value="">Todos</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1 xl:flex-none">
              Filtrar
            </Button>
            <ButtonLink href="/atendimentos" variant="ghost">
              Limpar
            </ButtonLink>
          </div>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
          <p className="text-[12.5px] text-ink-soft">
            <span className="font-medium text-ink">{items.length}</span>{" "}
            {items.length === 1 ? "registro" : "registros"} · {completed.length} realizados ·{" "}
            <span className="font-medium text-ink">{formatBRL(completedValue)}</span> faturados
          </p>
          <p className="text-[11.5px] text-ink-soft">
            {formatDate(fromDateInput(de))} a {formatDate(fromDateInput(ate))}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title={filtered ? "Nenhum atendimento com esses filtros" : "Nenhum atendimento no período"}
            description={
              filtered
                ? "Ajuste o período ou limpe os filtros para ver todos os registros."
                : "Registre a primeira sessão para começar a acompanhar o movimento da clínica."
            }
            action={filtered ? { href: "/atendimentos", label: "Limpar filtros" } : { href: "/atendimentos/novo", label: "Novo atendimento" }}
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-[13px] lg:table">
              <thead>
                <tr className="border-b border-line text-[11px] text-ink-soft">
                  <th className="px-5 py-2.5 font-medium">Data e horário</th>
                  <th className="px-4 py-2.5 font-medium">Paciente</th>
                  <th className="px-4 py-2.5 font-medium">Tipo</th>
                  <th className="px-4 py-2.5 text-right font-medium">Valor</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-paper/60">
                    <td className="px-5 py-3">
                      <p className="font-medium tabular-nums">{formatDate(item.scheduledAt, "dd/MM/yyyy")}</p>
                      <p className="text-[11px] text-ink-soft tabular-nums">{formatTime(item.scheduledAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/pacientes/${item.patientId}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {item.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{item.serviceTypeName}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatBRL(item.priceCents)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "scheduled" ? (
                          <form action={setAppointmentStatusAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="completed" />
                            <button
                              type="submit"
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2 text-[11.5px] font-medium text-pine transition hover:border-pine/40 hover:bg-pine-soft"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Concluir
                            </button>
                          </form>
                        ) : null}
                        <Link
                          href={`/atendimentos/${item.id}`}
                          aria-label="Editar atendimento"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line/70 lg:hidden">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-ink tabular-nums">
                        {formatDate(item.scheduledAt, "dd/MM")} · {formatTime(item.scheduledAt)}
                      </p>
                      <Link
                        href={`/pacientes/${item.patientId}`}
                        className="mt-0.5 block truncate text-[13.5px] font-medium text-ink"
                      >
                        {item.patientName}
                      </Link>
                      <p className="truncate text-[12px] text-ink-soft">{item.serviceTypeName}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-[12px] font-medium tabular-nums">
                          {formatBRL(item.priceCents)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/atendimentos/${item.id}`}
                      aria-label="Editar atendimento"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                  {item.status === "scheduled" ? (
                    <form action={setAppointmentStatusAction} className="mt-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[11.5px] font-medium text-pine transition hover:bg-pine-soft"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Marcar como realizado
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}

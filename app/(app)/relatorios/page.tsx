import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Download, FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PrintButton } from "@/components/report/print-button";
import {
  APPOINTMENT_STATUSES,
  formatBRL,
  pluralize,
  serviceColorHex,
  STATUS_META,
} from "@/lib/format";
import { listPatients, listServiceTypes } from "@/lib/queries";
import { buildReport, parseReportFilters } from "@/lib/report";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Relatórios" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = parseReportFilters(await searchParams);

  const [report, patients, types] = await Promise.all([
    buildReport(params),
    listPatients({}),
    listServiceTypes(true),
  ]);

  const query = new URLSearchParams({ de: params.de, ate: params.ate, status: params.status });
  if (params.patientId) query.set("paciente", params.patientId);
  if (params.serviceTypeId) query.set("tipo", params.serviceTypeId);
  const queryString = query.toString();

  const maxValue = Math.max(...report.rows.map((row) => row.totalCents), 1);
  const totalStatus = Object.values(report.statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Quantidade e faturamento por tipo de atendimento no período selecionado."
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            <a
              href={`/api/relatorios/csv?${queryString}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink transition hover:border-pine/35 hover:bg-pine-soft/50"
            >
              <Download className="h-4 w-4" />
              CSV
            </a>
            <a
              href={`/api/relatorios/pdf?${queryString}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink transition hover:border-pine/35 hover:bg-pine-soft/50"
            >
              <FileText className="h-4 w-4" />
              PDF
            </a>
            <PrintButton />
          </div>
        }
      />

      <Panel className="no-print mb-5">
        <form method="get" className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[132px_132px_1fr_1fr_160px_auto]">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">De</span>
            <Input type="date" name="de" defaultValue={params.de} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Até</span>
            <Input type="date" name="ate" defaultValue={params.ate} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Paciente</span>
            <Select name="paciente" defaultValue={params.patientId}>
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
            <Select name="tipo" defaultValue={params.serviceTypeId}>
              <option value="">Todos</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">Status</span>
            <Select name="status" defaultValue={params.status}>
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
              <option value="all">Todos os status</option>
            </Select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-pine px-4 text-sm font-medium text-white transition hover:bg-pine-deep xl:flex-none"
            >
              Atualizar
            </button>
            <Link
              href="/relatorios"
              className="inline-flex h-11 items-center px-2 text-[13px] font-medium text-ink-soft hover:text-ink"
            >
              Mês atual
            </Link>
          </div>
        </form>
      </Panel>

      <Panel className="mb-6 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Atendimentos no filtro</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums">
              {report.totalCount}
            </p>
            <p className="mt-1 text-[11px] text-ink-soft">{report.statusLabel}</p>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Total faturado</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums text-pine">
              {formatBRL(report.totalCents)}
            </p>
            <p className="mt-1 text-[11px] text-ink-soft">
              {pluralize(report.rows.length, "tipo de atendimento", "tipos de atendimento")}
            </p>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Valor médio por sessão</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums">
              {formatBRL(report.averageCents)}
            </p>
            <p className="mt-1 text-[11px] text-ink-soft">Média do período</p>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Faltas no período</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums">
              {report.statusCounts.no_show ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-ink-soft">
              {report.statusCounts.canceled ?? 0}{" "}
              {pluralize(report.statusCounts.canceled ?? 0, "cancelamento", "cancelamentos")}
            </p>
          </div>
        </div>
      </Panel>

      <Panel className="print-plain mb-6 overflow-hidden">
        <PanelHeader
          title="Por tipo de atendimento"
          description={`${report.filters.de.split("-").reverse().join("/")} a ${report.filters.ate
            .split("-")
            .reverse()
            .join("/")} · ${report.patientName ?? "todos os pacientes"}${
            report.serviceTypeName ? ` · ${report.serviceTypeName}` : ""
          }`}
        />

        {report.rows.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            title="Sem atendimentos no período"
            description="Ajuste o período, o status ou os filtros para encontrar os registros."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-[11px] text-ink-soft">
                    <th className="px-5 py-2.5 font-medium">Tipo de atendimento</th>
                    <th className="px-4 py-2.5 text-right font-medium">Quantidade</th>
                    <th className="px-4 py-2.5 text-right font-medium">Valor médio</th>
                    <th className="px-5 py-2.5 text-right font-medium">Total</th>
                    <th className="px-4 py-2.5 text-right font-medium">Participação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {report.rows.map((row) => {
                    const share = report.totalCents
                      ? Math.round((row.totalCents / report.totalCents) * 100)
                      : 0;
                    return (
                      <tr key={row.serviceTypeId}>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2.5 font-medium text-ink">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: serviceColorHex(row.color) }}
                            />
                            {row.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{row.count}</td>
                        <td className="px-4 py-3 text-right text-ink-soft tabular-nums">
                          {formatBRL(row.averageCents)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums">
                          {formatBRL(row.totalCents)}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-ink-soft tabular-nums">
                          {share}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-pine">
                    <td className="px-5 py-3.5 font-display text-[15px] font-semibold text-ink">
                      Total geral
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                      {report.totalCount}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[12.5px] text-ink-soft tabular-nums">
                      {formatBRL(report.averageCents)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-display text-[17px] font-semibold text-pine tabular-nums">
                      {formatBRL(report.totalCents)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[12px] text-ink-soft">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <ul className="divide-y divide-line/70 lg:hidden">
              {report.rows.map((row) => (
                <li key={row.serviceTypeId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-[13.5px] font-medium">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: serviceColorHex(row.color) }}
                      />
                      <span className="truncate">{row.name}</span>
                    </span>
                    <span className="shrink-0 text-[13.5px] font-semibold tabular-nums">
                      {formatBRL(row.totalCents)}
                    </span>
                  </div>
                  <p className="mt-0.5 pl-4 text-[11.5px] text-ink-soft">
                    {row.count} {pluralize(row.count, "atendimento", "atendimentos")} · média de{" "}
                    {formatBRL(row.averageCents)}
                  </p>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t-2 border-pine px-4 py-3">
                <span className="font-display text-[14px] font-semibold">Total geral</span>
                <span className="font-display text-[16px] font-semibold text-pine tabular-nums">
                  {formatBRL(report.totalCents)}
                </span>
              </li>
            </ul>

            <p className="border-t border-line px-5 py-3 text-[11px] leading-relaxed text-ink-soft">
              {report.totalCount}{" "}
              {pluralize(report.totalCount, "atendimento somado", "atendimentos somados")}. Os
              valores usam o preço registrado em cada atendimento, não o valor atual da tabela.
            </p>
          </>
        )}
      </Panel>

      {report.rows.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="print-plain">
            <PanelHeader title="Distribuição por faturamento" />
            <div className="space-y-4 px-5 py-4">
              {report.rows.map((row) => {
                const percent = Math.round((row.totalCents / maxValue) * 100);
                const hex = serviceColorHex(row.color);
                return (
                  <div key={row.serviceTypeId}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[12.5px] font-medium">{row.name}</span>
                      <span className="shrink-0 text-[12px] font-semibold tabular-nums">
                        {formatBRL(row.totalCents)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: hex }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="print-plain">
            <PanelHeader
              title="Atendimentos por status"
              description="Todo o período, independente do filtro de status"
            />
            <ul className="divide-y divide-line/70">
              {APPOINTMENT_STATUSES.map((status) => {
                const count = report.statusCounts[status] ?? 0;
                const share = totalStatus ? Math.round((count / totalStatus) * 100) : 0;
                return (
                  <li key={status} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[status].dot}`}
                    />
                    <span className="flex-1 text-[13px] font-medium">
                      {STATUS_META[status].label}
                    </span>
                    <span className="text-[12px] text-ink-soft tabular-nums">{share}%</span>
                    <span className="w-8 text-right text-[13px] font-semibold tabular-nums">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

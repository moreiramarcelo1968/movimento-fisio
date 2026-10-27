import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus, Search, Users } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, Flash, PageHeader } from "@/components/ui/page";
import { Panel } from "@/components/ui/panel";
import { listPatients } from "@/lib/queries";
import { formatPhone } from "@/lib/format";
import { formatDateOnly } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pacientes" };

type SearchParams = Promise<{ q?: string; status?: string; salvo?: string }>;

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-pine-soft px-2.5 py-1 text-[11.5px] font-medium text-pine-deep"
          : "inline-flex items-center gap-1.5 rounded-full bg-[#eceeec] px-2.5 py-1 text-[11.5px] font-medium text-ink-soft"
      }
    >
      <span className={active ? "h-1.5 w-1.5 rounded-full bg-pine" : "h-1.5 w-1.5 rounded-full bg-[#8b9792]"} />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export default async function PatientsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const status = params.status === "active" || params.status === "inactive" ? params.status : "all";
  const filtered = Boolean(q) || status !== "all";

  const patients = await listPatients({ search: q, status });

  return (
    <div>
      <PageHeader
        title="Pacientes"
        description="Cadastro, contato e histórico de cada pessoa atendida na clínica."
        actions={
          <ButtonLink href="/pacientes/novo">
            <Plus className="h-4 w-4" />
            Novo paciente
          </ButtonLink>
        }
      />

      {params.salvo === "1" ? <Flash>Cadastro do paciente salvo.</Flash> : null}
      {params.salvo === "excluido" ? <Flash>Paciente excluído.</Flash> : null}

      <Panel className="overflow-hidden">
        <div className="border-b border-line p-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nome ou telefone"
                className="pl-9"
                aria-label="Buscar pacientes"
              />
            </div>
            <Select
              name="status"
              defaultValue={status}
              aria-label="Filtrar por situação"
              className="w-auto min-w-[140px]"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </Select>
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
            {filtered ? (
              <ButtonLink href="/pacientes" variant="ghost">
                Limpar
              </ButtonLink>
            ) : null}
          </form>
        </div>

        {patients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title={filtered ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
            description={
              filtered
                ? "Tente outro nome, telefone ou ajuste a situação do cadastro."
                : "Comece cadastrando a primeira pessoa atendida na clínica."
            }
            action={
              filtered
                ? undefined
                : { href: "/pacientes/novo", label: "Cadastrar paciente" }
            }
          />
        ) : (
          <>
            <p className="px-5 py-3 text-[12px] text-ink-soft">
              {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
            </p>

            <table className="hidden w-full text-left text-[13.5px] lg:table">
              <thead>
                <tr className="border-y border-line text-[11.5px] text-ink-soft">
                  <th className="px-5 py-2.5 font-medium">Paciente</th>
                  <th className="px-4 py-2.5 font-medium">Contato</th>
                  <th className="px-4 py-2.5 text-right font-medium">Atendimentos</th>
                  <th className="px-4 py-2.5 font-medium">Último realizado</th>
                  <th className="px-4 py-2.5 font-medium">Situação</th>
                  <th className="w-10 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {patients.map((patient) => (
                  <tr key={patient.id} className="transition hover:bg-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/pacientes/${patient.id}`}
                        className="font-semibold text-ink hover:underline"
                      >
                        {patient.name}
                      </Link>
                      {patient.email ? (
                        <p className="text-[11.5px] text-ink-soft">{patient.email}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatPhone(patient.phone)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {patient.appointmentCount}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {patient.lastVisit ? (
                        formatDateOnly(patient.lastVisit)
                      ) : (
                        <span className="text-ink-soft/70">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill active={patient.active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/pacientes/${patient.id}`}
                        aria-label={`Abrir ficha de ${patient.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line/70 lg:hidden">
              {patients.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="flex items-start justify-between gap-3 px-4 py-3.5 transition hover:bg-paper/60"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[14px] font-semibold text-ink">
                          {patient.name}
                        </span>
                        <StatusPill active={patient.active} />
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-ink-soft">
                        {formatPhone(patient.phone)}
                      </p>
                      <p className="mt-1 text-[11.5px] text-ink-soft">
                        {patient.appointmentCount}{" "}
                        {patient.appointmentCount === 1 ? "atendimento" : "atendimentos"}
                        {patient.lastVisit
                          ? ` · último em ${formatDateOnly(patient.lastVisit)}`
                          : " · sem atendimentos"}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-soft" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}

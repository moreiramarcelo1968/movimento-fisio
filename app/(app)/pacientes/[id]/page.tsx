import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  ClipboardList,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  UserRound,
  Wallet,
} from "lucide-react";
import { deletePatientAction, togglePatientAction } from "@/app/actions/patients";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { EmptyState, Flash, PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  ageFromBirthDate,
  formatBRL,
  formatDateOnly,
  formatPhone,
  pluralize,
} from "@/lib/format";
import { getPatientDetail } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string; erro?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getPatientDetail(id);
  return { title: detail?.patient.name ?? "Paciente" };
}

export default async function PatientDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const detail = await getPatientDetail(id);
  if (!detail) notFound();

  const query = await searchParams;
  const { patient, history, byType, totalCompleted, totalValue } = detail;
  const age = ageFromBirthDate(patient.birthDate);
  const scheduled = history.filter((item) => item.status === "scheduled").length;
  const lastVisit = history.find((item) => item.status === "completed");

  return (
    <div>
      <Link
        href="/pacientes"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Pacientes
      </Link>

      {query.salvo === "1" ? <Flash>Cadastro do paciente salvo.</Flash> : null}
      {query.erro === "vinculado" ? (
        <Flash tone="error">
          Não é possível excluir: este paciente já possui atendimentos registrados. Desative o
          cadastro para preservar o histórico.
        </Flash>
      ) : null}

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {patient.name}
            {!patient.active ? (
              <span className="rounded-full bg-[#eceeec] px-2.5 py-1 text-[11.5px] font-medium text-ink-soft">
                Inativo
              </span>
            ) : null}
          </span>
        }
        description={[
          age !== null ? `${age} anos` : null,
          formatPhone(patient.phone),
          patient.email,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <>
            <ButtonLink href={`/atendimentos/novo?paciente=${patient.id}`}>
              <CalendarPlus className="h-4 w-4" />
              Novo atendimento
            </ButtonLink>
            <ButtonLink href={`/pacientes/${patient.id}/editar`} variant="secondary">
              <Pencil className="h-4 w-4" />
              Editar cadastro
            </ButtonLink>
          </>
        }
      />

      <Panel className="mb-6 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Atendimentos realizados</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums">
              {totalCompleted}
            </p>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Faturado no histórico</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums">
              {formatBRL(totalValue)}
            </p>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Último realizado</p>
            <p className="mt-1.5 font-display text-[20px] leading-none font-semibold">
              {lastVisit ? formatDate(lastVisit.scheduledAt, "dd/MM/yyyy") : "—"}
            </p>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <p className="text-[11.5px] text-ink-soft">Agendados</p>
            <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tabular-nums">
              {scheduled}
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Histórico de atendimentos"
            description={`${history.length} ${pluralize(history.length, "registro", "registros")}`}
            action={
              <ButtonLink href={`/atendimentos/novo?paciente=${patient.id}`} variant="ghost" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Agendar
              </ButtonLink>
            }
          />

          {history.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" />}
              title="Nenhum atendimento ainda"
              description="Registre a primeira sessão para acompanhar o histórico e o faturamento deste paciente."
              action={{
                href: `/atendimentos/novo?paciente=${patient.id}`,
                label: "Registrar atendimento",
              }}
            />
          ) : (
            <>
              <table className="hidden w-full text-left text-[13px] lg:table">
                <thead>
                  <tr className="border-b border-line text-[11px] text-ink-soft">
                    <th className="px-5 py-2.5 font-medium">Data</th>
                    <th className="px-4 py-2.5 font-medium">Tipo</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {history.map((item) => (
                    <tr key={item.id} className="transition hover:bg-paper/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/atendimentos/${item.id}`}
                          className="font-medium text-ink hover:underline tabular-nums"
                        >
                          {formatDate(item.scheduledAt, "dd/MM/yyyy")}
                        </Link>
                        <p className="text-[11px] text-ink-soft tabular-nums">
                          {formatTime(item.scheduledAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{item.serviceTypeName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatBRL(item.priceCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="divide-y divide-line/70 lg:hidden">
                {history.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/atendimentos/${item.id}`}
                      className="flex items-start justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-ink tabular-nums">
                          {formatDate(item.scheduledAt, "dd/MM/yyyy")} · {formatTime(item.scheduledAt)}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-ink-soft">
                          {item.serviceTypeName}
                        </p>
                        <div className="mt-1.5">
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <span className="shrink-0 text-[13px] font-medium tabular-nums">
                        {formatBRL(item.priceCents)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Ficha" />
            <PanelBody className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[11px] text-ink-soft">Telefone</p>
                  <p className="text-[13.5px] font-medium">{formatPhone(patient.phone)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[11px] text-ink-soft">E-mail</p>
                  <p className="text-[13.5px] font-medium">{patient.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[11px] text-ink-soft">Nascimento e CPF</p>
                  <p className="text-[13.5px] font-medium">
                    {formatDateOnly(patient.birthDate) || "—"}
                    {patient.cpf ? ` · ${patient.cpf}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[11px] text-ink-soft">Endereço</p>
                  <p className="text-[13.5px] font-medium">{patient.address || "—"}</p>
                </div>
              </div>

              {patient.notes ? (
                <div className="rounded-xl bg-paper px-3.5 py-3">
                  <p className="text-[11px] text-ink-soft">Observações</p>
                  <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line">
                    {patient.notes}
                  </p>
                </div>
              ) : null}
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Por tipo de atendimento" description="Apenas realizados" />
            {byType.length === 0 ? (
              <PanelBody>
                <p className="text-[13px] text-ink-soft">
                  Sem atendimentos concluídos para resumir.
                </p>
              </PanelBody>
            ) : (
              <ul className="divide-y divide-line/70">
                {byType.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{item.name}</p>
                      <p className="text-[11.5px] text-ink-soft">
                        {item.count} {pluralize(item.count, "sessão", "sessões")}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                      {formatBRL(item.totalCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Cadastro" description="Ações do prontuário" />
            <PanelBody className="space-y-3">
              <form action={togglePatientAction}>
                <input type="hidden" name="id" value={patient.id} />
                <SubmitButton variant="secondary" size="sm" pendingLabel="Atualizando...">
                  {patient.active ? "Desativar cadastro" : "Reativar cadastro"}
                </SubmitButton>
              </form>
              <p className="text-[11.5px] leading-relaxed text-ink-soft">
                Pacientes inativos saem das listas de agendamento, mas mantêm todo o histórico.
              </p>

              {history.length === 0 ? (
                <form action={deletePatientAction} className="border-t border-line pt-3">
                  <input type="hidden" name="id" value={patient.id} />
                  <ConfirmSubmit
                    message={`Excluir o cadastro de ${patient.name}? Esta ação não pode ser desfeita.`}
                  >
                    Excluir cadastro
                  </ConfirmSubmit>
                </form>
              ) : (
                <p className="border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-soft">
                  Para excluir definitivamente, remova antes todos os atendimentos vinculados.
                </p>
              )}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}

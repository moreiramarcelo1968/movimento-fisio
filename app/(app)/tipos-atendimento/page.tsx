import type { Metadata } from "next";
import Link from "next/link";
import { Info, Pencil, Plus, Tags } from "lucide-react";
import { deleteServiceTypeAction, toggleServiceTypeAction } from "@/app/actions/service-types";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { EmptyState, Flash, PageHeader } from "@/components/ui/page";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatBRL, serviceColorHex } from "@/lib/format";
import { durationLabel } from "@/lib/time";
import { listServiceTypes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tipos de atendimento" };

type SearchParams = Promise<{ salvo?: string; erro?: string }>;

export default async function ServiceTypesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const types = await listServiceTypes(true);
  const activeCount = types.filter((type) => type.active).length;

  return (
    <div>
      <PageHeader
        title="Tipos de atendimento"
        description="Defina os procedimentos, a duração e o valor de cada sessão."
        actions={
          <ButtonLink href="/tipos-atendimento/novo">
            <Plus className="h-4 w-4" />
            Novo tipo
          </ButtonLink>
        }
      />

      {params.salvo === "1" ? <Flash>Tipo de atendimento salvo.</Flash> : null}
      {params.salvo === "excluido" ? <Flash>Tipo de atendimento excluído.</Flash> : null}
      {params.erro === "vinculado" ? (
        <Flash tone="error">
          Este tipo já foi usado em atendimentos e não pode ser excluído. Desative-o para tirar das
          novas opções.
        </Flash>
      ) : null}

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          O valor é copiado para cada atendimento no momento do registro. Se o preço mudar depois,
          os relatórios antigos continuam com o valor cobrado na época.
        </p>
      </div>

      {types.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-surface">
          <EmptyState
            icon={<Tags className="h-5 w-5" />}
            title="Nenhum tipo cadastrado"
            description="Cadastre os procedimentos da clínica para começar a registrar atendimentos."
            action={{ href: "/tipos-atendimento/novo", label: "Cadastrar tipo" }}
          />
        </div>
      ) : (
        <>
          <p className="mb-3 text-[12px] text-ink-soft">
            {types.length} {types.length === 1 ? "tipo cadastrado" : "tipos cadastrados"} ·{" "}
            {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {types.map((type) => {
              const hex = serviceColorHex(type.color);
              return (
                <article
                  key={type.id}
                  className="flex flex-col rounded-[18px] border border-line bg-surface p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                      <h2 className="truncate font-display text-[16px] font-semibold text-ink">
                        {type.name}
                      </h2>
                    </div>
                    <span
                      className={
                        type.active
                          ? "shrink-0 rounded-full bg-pine-soft px-2 py-0.5 text-[10.5px] font-medium text-pine-deep"
                          : "shrink-0 rounded-full bg-[#eceeec] px-2 py-0.5 text-[10.5px] font-medium text-ink-soft"
                      }
                    >
                      {type.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 min-h-[34px] text-[12.5px] leading-relaxed text-ink-soft">
                    {type.description || "Sem descrição."}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-display text-[22px] leading-none font-semibold text-ink tabular-nums">
                        {formatBRL(type.priceCents)}
                      </p>
                      <p className="mt-1 text-[11.5px] text-ink-soft">
                        {durationLabel(type.durationMin)} · {type.completedCount}{" "}
                        {type.completedCount === 1 ? "realizado" : "realizados"}
                      </p>
                    </div>
                    <Link
                      href={`/tipos-atendimento/${type.id}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                    <form action={toggleServiceTypeAction}>
                      <input type="hidden" name="id" value={type.id} />
                      <SubmitButton variant="ghost" size="sm" pendingLabel="Atualizando...">
                        {type.active ? "Desativar" : "Ativar"}
                      </SubmitButton>
                    </form>
                    {type.appointmentCount === 0 ? (
                      <form action={deleteServiceTypeAction}>
                        <input type="hidden" name="id" value={type.id} />
                        <ConfirmSubmit
                          message={`Excluir o tipo "${type.name}"?`}
                          variant="ghost"
                        >
                          Excluir
                        </ConfirmSubmit>
                      </form>
                    ) : (
                      <span className="text-[11px] text-ink-soft">
                        {type.appointmentCount}{" "}
                        {type.appointmentCount === 1 ? "atendimento" : "atendimentos"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { saveServiceTypeAction } from "@/app/actions/service-types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { formatCentsInput, SERVICE_COLOR_OPTIONS } from "@/lib/format";
import { idleFormState } from "@/lib/utils";

export type ServiceTypeInitial = {
  id?: string;
  name?: string;
  description?: string | null;
  durationMin?: number;
  priceCents?: number;
  color?: string;
  active?: boolean;
};

export function ServiceTypeForm({
  serviceType,
  cancelHref,
}: {
  serviceType?: ServiceTypeInitial;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(saveServiceTypeAction, idleFormState);
  const [price, setPrice] = useState(
    serviceType?.priceCents !== undefined ? formatCentsInput(serviceType.priceCents) : "",
  );

  return (
    <form action={formAction} className="space-y-5">
      {serviceType?.id ? <input type="hidden" name="id" value={serviceType.id} /> : null}

      {state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome do atendimento"
          htmlFor="name"
          required
          error={state.errors?.name}
          className="sm:col-span-2"
        >
          <Input
            id="name"
            name="name"
            defaultValue={serviceType?.name ?? ""}
            placeholder="Ex.: Sessão de fisioterapia"
            required
          />
        </Field>

        <Field
          label="Valor por atendimento"
          htmlFor="price"
          required
          error={state.errors?.price}
          hint="O valor é copiado para o atendimento no momento do registro."
        >
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[13px] text-ink-soft">
              R$
            </span>
            <Input
              id="price"
              name="price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="160,00"
              inputMode="decimal"
              className="pl-10"
              required
            />
          </div>
        </Field>

        <Field
          label="Duração"
          htmlFor="durationMin"
          required
          error={state.errors?.durationMin}
        >
          <div className="relative">
            <Input
              id="durationMin"
              name="durationMin"
              type="number"
              min={5}
              max={480}
              step={5}
              defaultValue={serviceType?.durationMin ?? 50}
              className="pr-14"
              required
            />
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] text-ink-soft">
              min
            </span>
          </div>
        </Field>

        <Field
          label="Descrição"
          htmlFor="description"
          hint="Opcional, aparece apenas no cadastro."
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={serviceType?.description ?? ""}
            placeholder="O que está incluído neste atendimento"
          />
        </Field>

        <Field label="Cor de identificação" className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {SERVICE_COLOR_OPTIONS.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={option.value}
                  defaultChecked={(serviceType?.color ?? "teal") === option.value}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-2 rounded-full border border-line px-3 py-2 text-[12.5px] text-ink-soft transition peer-checked:border-pine peer-checked:bg-pine-soft peer-checked:text-pine-deep peer-focus-visible:ring-2 peer-focus-visible:ring-pine/30">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: option.hex }}
                  />
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </Field>

        <label className="flex items-center gap-2.5 sm:col-span-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={serviceType?.active ?? true}
            className="h-4 w-4 rounded border-line accent-pine"
          />
          <span className="text-[13px] text-ink">
            Disponível para novos atendimentos
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : serviceType?.id
              ? "Salvar alterações"
              : "Cadastrar atendimento"}
        </Button>
        <ButtonLink href={cancelHref} variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { savePatientAction } from "@/app/actions/patients";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { idleFormState } from "@/lib/utils";

export type PatientInitial = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  birthDate?: string | null;
  cpf?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function PatientForm({
  patient,
  cancelHref,
}: {
  patient?: PatientInitial;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(savePatientAction, idleFormState);

  return (
    <form action={formAction} className="space-y-5">
      {patient?.id ? <input type="hidden" name="id" value={patient.id} /> : null}

      {state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome completo"
          htmlFor="name"
          required
          error={state.errors?.name}
          className="sm:col-span-2"
        >
          <Input
            id="name"
            name="name"
            defaultValue={patient?.name ?? ""}
            placeholder="Ex.: Ana Paula Ribeiro"
            autoComplete="name"
            required
          />
        </Field>

        <Field
          label="Telefone / WhatsApp"
          htmlFor="phone"
          required
          error={state.errors?.phone}
        >
          <Input
            id="phone"
            name="phone"
            defaultValue={patient?.phone ?? ""}
            placeholder="(11) 91234-5678"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </Field>

        <Field label="E-mail" htmlFor="email" error={state.errors?.email} hint="Opcional">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={patient?.email ?? ""}
            placeholder="ana@email.com"
            autoComplete="email"
          />
        </Field>

        <Field
          label="Data de nascimento"
          htmlFor="birthDate"
          error={state.errors?.birthDate}
          hint="Opcional"
        >
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={patient?.birthDate?.slice(0, 10) ?? ""}
          />
        </Field>

        <Field label="CPF" htmlFor="cpf" hint="Opcional">
          <Input
            id="cpf"
            name="cpf"
            defaultValue={patient?.cpf ?? ""}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
        </Field>

        <Field label="Endereço" htmlFor="address" hint="Opcional" className="sm:col-span-2">
          <Input
            id="address"
            name="address"
            defaultValue={patient?.address ?? ""}
            placeholder="Rua, número, bairro"
            autoComplete="street-address"
          />
        </Field>

        <Field
          label="Observações clínicas"
          htmlFor="notes"
          hint="Alergias, condições de saúde, preferências de horário."
          className="sm:col-span-2"
        >
          <Textarea
            id="notes"
            name="notes"
            defaultValue={patient?.notes ?? ""}
            placeholder="Informações úteis para o atendimento"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : patient?.id ? "Salvar alterações" : "Cadastrar paciente"}
        </Button>
        <ButtonLink href={cancelHref} variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}

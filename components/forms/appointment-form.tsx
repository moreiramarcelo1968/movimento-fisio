"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { saveAppointmentAction } from "@/app/actions/appointments";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import {
  APPOINTMENT_STATUSES,
  formatBRL,
  formatCentsInput,
  formatPhone,
  STATUS_META,
  type AppointmentStatus,
} from "@/lib/format";
import { addMinutes, formatTime, fromDateTimeInput, nextSlotInput } from "@/lib/time";
import { idleFormState } from "@/lib/utils";

export type PatientOption = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
};

export type ServiceTypeOption = {
  id: string;
  name: string;
  priceCents: number;
  durationMin: number;
  active: boolean;
};

export type AppointmentInitial = {
  id?: string;
  patientId?: string;
  serviceTypeId?: string;
  scheduledAt?: string;
  priceCents?: number;
  status?: AppointmentStatus;
  notes?: string;
};

export function AppointmentForm({
  patients,
  types,
  initial,
  cancelHref,
}: {
  patients: PatientOption[];
  types: ServiceTypeOption[];
  initial?: AppointmentInitial;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(saveAppointmentAction, idleFormState);

  const initialType = types.find((type) => type.id === initial?.serviceTypeId) ?? types[0];
  const [serviceTypeId, setServiceTypeId] = useState(initialType?.id ?? "");
  const [price, setPrice] = useState(
    initial?.priceCents !== undefined
      ? formatCentsInput(initial.priceCents)
      : initialType
        ? formatCentsInput(initialType.priceCents)
        : "",
  );
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? nextSlotInput());
  const [status, setStatus] = useState<AppointmentStatus>(initial?.status ?? "scheduled");

  const selectedType = types.find((type) => type.id === serviceTypeId);

  const endLabel = useMemo(() => {
    if (!scheduledAt || !selectedType) return null;
    const start = fromDateTimeInput(scheduledAt);
    if (Number.isNaN(start.getTime())) return null;
    return `Termina às ${formatTime(addMinutes(start, selectedType.durationMin))} · ${selectedType.durationMin} min`;
  }, [scheduledAt, selectedType]);

  function handleTypeChange(value: string) {
    setServiceTypeId(value);
    const type = types.find((item) => item.id === value);
    if (type) setPrice(formatCentsInput(type.priceCents));
  }

  return (
    <form action={formAction} className="space-y-5">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      {patients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-3 text-[13px] text-ink-soft">
          Nenhum paciente ativo cadastrado.{" "}
          <Link href="/pacientes/novo" className="font-medium text-pine underline">
            Cadastre um paciente
          </Link>{" "}
          para registrar o atendimento.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Paciente"
          htmlFor="patientId"
          required
          error={state.errors?.patientId}
          className="sm:col-span-2"
        >
          <Select
            id="patientId"
            name="patientId"
            defaultValue={initial?.patientId ?? ""}
            required
          >
            <option value="" disabled>
              Selecione o paciente
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
                {patient.active ? "" : " (inativo)"} — {formatPhone(patient.phone)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Tipo de atendimento"
          htmlFor="serviceTypeId"
          required
          error={state.errors?.serviceTypeId}
        >
          <Select
            id="serviceTypeId"
            name="serviceTypeId"
            value={serviceTypeId}
            onChange={(event) => handleTypeChange(event.target.value)}
            required
          >
            <option value="" disabled>
              Selecione
            </option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
                {type.active ? "" : " (inativo)"}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Valor"
          htmlFor="price"
          required
          error={state.errors?.price}
          hint={selectedType ? `Valor de tabela: ${formatBRL(selectedType.priceCents)}` : undefined}
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
          label="Data e horário"
          htmlFor="scheduledAt"
          required
          error={state.errors?.scheduledAt}
          hint={endLabel ?? undefined}
        >
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            required
          />
        </Field>

        <Field
          label="Status"
          htmlFor="status"
          error={state.errors?.status}
          hint={STATUS_META[status].hint}
        >
          <Select
            id="status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
          >
            {APPOINTMENT_STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_META[option].label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Observações"
          htmlFor="notes"
          hint="Opcional: evolução, orientações ou forma de pagamento."
          className="sm:col-span-2"
        >
          <Textarea
            id="notes"
            name="notes"
            defaultValue={initial?.notes ?? ""}
            placeholder="Ex.: paciente relatou melhora na lombalgia"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <Button type="submit" disabled={pending || patients.length === 0}>
          {pending
            ? "Salvando..."
            : initial?.id
              ? "Salvar atendimento"
              : "Registrar atendimento"}
        </Button>
        <ButtonLink href={cancelHref} variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}

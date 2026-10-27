"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileAction,
} from "@/app/actions/auth";
import { saveClinicAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { idleFormState } from "@/lib/utils";

function Feedback({ state }: { state: { status: string; message?: string } }) {
  if (!state.message) return null;
  if (state.status === "success") {
    return <FormMessage tone="success">{state.message}</FormMessage>;
  }
  if (state.status === "error") {
    return <FormMessage tone="error">{state.message}</FormMessage>;
  }
  return null;
}

export function ClinicForm({
  clinic,
}: {
  clinic: { clinicName: string; professionalName: string; phone: string; address: string };
}) {
  const [state, formAction, pending] = useActionState(saveClinicAction, idleFormState);

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome da clínica"
          htmlFor="clinicName"
          required
          error={state.errors?.clinicName}
          className="sm:col-span-2"
        >
          <Input
            id="clinicName"
            name="clinicName"
            defaultValue={clinic.clinicName}
            placeholder="Clínica Movimento"
            required
          />
        </Field>

        <Field
          label="Fisioterapeuta responsável"
          htmlFor="professionalName"
          hint="Aparece no cabeçalho dos relatórios."
          error={state.errors?.professionalName}
        >
          <Input
            id="professionalName"
            name="professionalName"
            defaultValue={clinic.professionalName}
            placeholder="Marina Alves"
            autoComplete="name"
          />
        </Field>

        <Field label="Telefone" htmlFor="phone" error={state.errors?.phone} hint="Opcional">
          <Input
            id="phone"
            name="phone"
            defaultValue={clinic.phone}
            placeholder="(11) 3333-4444"
            inputMode="tel"
          />
        </Field>

        <Field
          label="Endereço"
          htmlFor="address"
          error={state.errors?.address}
          hint="Opcional"
          className="sm:col-span-2"
        >
          <Input
            id="address"
            name="address"
            defaultValue={clinic.address}
            placeholder="Rua, número, bairro, cidade"
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-line pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar dados da clínica"}
        </Button>
      </div>
    </form>
  );
}

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, idleFormState);

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Seu nome" htmlFor="profile-name" required error={state.errors?.name}>
          <Input
            id="profile-name"
            name="name"
            defaultValue={user.name}
            autoComplete="name"
            required
          />
        </Field>

        <Field
          label="E-mail de acesso"
          htmlFor="profile-email"
          required
          error={state.errors?.email}
        >
          <Input
            id="profile-email"
            name="email"
            type="email"
            defaultValue={user.email}
            inputMode="email"
            autoComplete="email"
            required
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-line pt-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Salvando..." : "Atualizar perfil"}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, idleFormState);

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Senha atual"
          htmlFor="currentPassword"
          required
          error={state.errors?.currentPassword}
          className="sm:col-span-2"
        >
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Field
          label="Nova senha"
          htmlFor="newPassword"
          required
          error={state.errors?.newPassword}
          hint="Mínimo de 8 caracteres."
        >
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>

        <Field
          label="Confirmar nova senha"
          htmlFor="confirmPassword"
          required
          error={state.errors?.confirmPassword}
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-line pt-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Alterando..." : "Alterar senha"}
        </Button>
      </div>
    </form>
  );
}

import type { Metadata } from "next";
import {
  Download,
  LogOut,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  ClinicForm,
  PasswordForm,
  ProfileForm,
} from "@/components/forms/settings-forms";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Brand } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await requireUser();
  const clinic = await getSettings();

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Dados da clínica, acesso e preferências do aplicativo."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title={
                <span className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-pine" />
                  Dados da clínica
                </span>
              }
              description="Usados no topo do sistema e nos relatórios exportados."
            />
            <PanelBody>
              <ClinicForm
                clinic={{
                  clinicName: clinic.clinicName,
                  professionalName: clinic.professionalName,
                  phone: clinic.phone ?? "",
                  address: clinic.address ?? "",
                }}
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title={
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-pine" />
                  Seu perfil
                </span>
              }
              description="Nome exibido no sistema e e-mail usado para entrar."
            />
            <PanelBody>
              <ProfileForm user={{ name: user.name, email: user.email }} />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-pine" />
                  Senha de acesso
                </span>
              }
              description="Troque a senha periodicamente e não compartilhe o acesso."
            />
            <PanelBody>
              <PasswordForm />
            </PanelBody>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Instalar no celular" />
            <PanelBody className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">Como instalar</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                    No celular, abra o sistema no navegador e escolha{" "}
                    <span className="font-medium text-ink">Adicionar à tela de início</span>{" "}
                    (Android) ou{" "}
                    <span className="font-medium text-ink">
                      Compartilhar → Adicionar à Tela de Início
                    </span>{" "}
                    (iPhone). O app abre em tela cheia, como um aplicativo nativo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-line pt-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-marigold-soft text-[#7d5a12]">
                  <Download className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">Dados sempre online</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                    Tudo é salvo direto no banco da clínica. Sem internet, as telas já
                    carregadas continuam visíveis, mas é preciso conexão para salvar.
                  </p>
                </div>
              </div>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Sessão" />
            <PanelBody className="space-y-3">
              <div>
                <p className="text-[13px] font-medium text-ink">{user.name}</p>
                <p className="text-[12px] text-ink-soft">{user.email}</p>
              </div>
              <form action={logoutAction} className="border-t border-line pt-3">
                <Button type="submit" variant="secondary" className="w-full">
                  <LogOut className="h-4 w-4" />
                  Sair do sistema
                </Button>
              </form>
            </PanelBody>
          </Panel>

          <div className="rounded-[18px] border border-line bg-surface px-5 py-5">
            <Brand />
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-soft">
              Sistema de gestão para fisioterapia. Pacientes, agenda, atendimentos e
              relatórios em um só lugar.
            </p>
            <p className="mt-3 text-[11px] text-ink-soft/80">Versão 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

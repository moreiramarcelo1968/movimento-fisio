import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceTypeForm } from "@/components/forms/service-type-form";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";

export const metadata: Metadata = { title: "Novo tipo de atendimento" };

export default function NewServiceTypePage() {
  return (
    <div>
      <Link
        href="/tipos-atendimento"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tipos de atendimento
      </Link>

      <PageHeader
        title="Novo tipo de atendimento"
        description="O valor cadastrado aqui será sugerido em cada novo atendimento."
      />

      <Panel className="max-w-2xl">
        <PanelHeader title="Dados do atendimento" />
        <PanelBody>
          <ServiceTypeForm cancelHref="/tipos-atendimento" />
        </PanelBody>
      </Panel>
    </div>
  );
}

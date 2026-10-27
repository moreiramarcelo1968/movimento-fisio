import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatientForm } from "@/components/forms/patient-form";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";

export const metadata: Metadata = { title: "Novo paciente" };

export default function NewPatientPage() {
  return (
    <div>
      <Link
        href="/pacientes"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Pacientes
      </Link>

      <PageHeader
        title="Novo paciente"
        description="Só o nome e o telefone são obrigatórios. O restante ajuda no acompanhamento clínico."
      />

      <Panel className="max-w-3xl">
        <PanelHeader title="Dados do paciente" />
        <PanelBody>
          <PatientForm cancelHref="/pacientes" />
        </PanelBody>
      </Panel>
    </div>
  );
}

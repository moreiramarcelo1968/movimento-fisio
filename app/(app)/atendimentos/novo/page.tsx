import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { listPatients, listServiceTypes } from "@/lib/queries";
import { nextSlotInput } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Novo atendimento" };

type PageProps = {
  searchParams: Promise<{ paciente?: string }>;
};

export default async function NewAppointmentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [patients, types] = await Promise.all([
    listPatients({ status: "active" }),
    listServiceTypes(false),
  ]);

  const selectedPatient = patients.find((patient) => patient.id === params.paciente);

  return (
    <div>
      <Link
        href="/atendimentos"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Atendimentos
      </Link>

      <PageHeader
        title="Novo atendimento"
        description="Registre uma sessão realizada ou agende um horário futuro."
      />

      <Panel className="max-w-3xl">
        <PanelHeader
          title="Dados do atendimento"
          description="O valor vem do tipo escolhido e pode ser ajustado para este registro."
        />
        <PanelBody>
          <AppointmentForm
            patients={patients.map((patient) => ({
              id: patient.id,
              name: patient.name,
              phone: patient.phone,
              active: patient.active,
            }))}
            types={types.map((type) => ({
              id: type.id,
              name: type.name,
              priceCents: type.priceCents,
              durationMin: type.durationMin,
              active: type.active,
            }))}
            initial={{ patientId: selectedPatient?.id, scheduledAt: nextSlotInput() }}
            cancelHref="/atendimentos"
          />
        </PanelBody>
      </Panel>
    </div>
  );
}

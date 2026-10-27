import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PatientForm } from "@/components/forms/patient-form";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { getPatient } from "@/lib/queries";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await getPatient(id);
  return { title: patient ? `Editar ${patient.name}` : "Editar paciente" };
}

export default async function EditPatientPage({ params }: PageProps) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  return (
    <div>
      <Link
        href={`/pacientes/${patient.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {patient.name}
      </Link>

      <PageHeader
        title="Editar cadastro"
        description="Atualize os dados de contato e as observações clínicas."
      />

      <Panel className="max-w-3xl">
        <PanelHeader title={patient.name} />
        <PanelBody>
          <PatientForm
            patient={{
              id: patient.id,
              name: patient.name,
              phone: patient.phone,
              email: patient.email,
              birthDate: patient.birthDate,
              cpf: patient.cpf,
              address: patient.address,
              notes: patient.notes,
            }}
            cancelHref={`/pacientes/${patient.id}`}
          />
        </PanelBody>
      </Panel>
    </div>
  );
}

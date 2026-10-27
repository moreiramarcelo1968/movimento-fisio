import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteAppointmentAction } from "@/app/actions/appointments";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { getAppointment, listPatients, listServiceTypes } from "@/lib/queries";
import { formatDate, toDateTimeInput } from "@/lib/time";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const appointment = await getAppointment(id);
  return { title: appointment ? "Editar atendimento" : "Atendimento" };
}

export default async function EditAppointmentPage({ params }: PageProps) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const [patients, types] = await Promise.all([listPatients({}), listServiceTypes(true)]);

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
        title="Editar atendimento"
        description={`Registrado em ${formatDate(appointment.createdAt, "dd/MM/yyyy 'às' HH:mm")}`}
      />

      <Panel className="max-w-3xl">
        <PanelHeader
          title="Dados do atendimento"
          description="Alterar o valor aqui não muda o cadastro do tipo de atendimento."
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
            initial={{
              id: appointment.id,
              patientId: appointment.patientId,
              serviceTypeId: appointment.serviceTypeId,
              scheduledAt: toDateTimeInput(appointment.scheduledAt),
              priceCents: appointment.priceCents,
              status: appointment.status as
                | "scheduled"
                | "completed"
                | "no_show"
                | "canceled",
              notes: appointment.notes ?? "",
            }}
            cancelHref="/atendimentos"
          />
        </PanelBody>
      </Panel>

      <div className="mt-4 max-w-3xl">
        <form action={deleteAppointmentAction} className="flex justify-end">
          <input type="hidden" name="id" value={appointment.id} />
          <input type="hidden" name="patientId" value={appointment.patientId} />
          <ConfirmSubmit
            message="Excluir este atendimento? Ele deixa de aparecer nos relatórios."
            variant="danger"
            size="sm"
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir atendimento
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}

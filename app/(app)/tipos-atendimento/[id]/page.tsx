import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ServiceTypeForm } from "@/components/forms/service-type-form";
import { PageHeader } from "@/components/ui/page";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { getServiceType } from "@/lib/queries";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const type = await getServiceType(id);
  return { title: type ? `Editar ${type.name}` : "Editar tipo de atendimento" };
}

export default async function EditServiceTypePage({ params }: PageProps) {
  const { id } = await params;
  const type = await getServiceType(id);
  if (!type) notFound();

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
        title="Editar tipo de atendimento"
        description="Mudanças de valor valem apenas para os próximos atendimentos."
      />

      <Panel className="max-w-2xl">
        <PanelHeader title={type.name} />
        <PanelBody>
          <ServiceTypeForm
            serviceType={{
              id: type.id,
              name: type.name,
              description: type.description,
              durationMin: type.durationMin,
              priceCents: type.priceCents,
              color: type.color,
              active: type.active,
            }}
            cancelHref="/tipos-atendimento"
          />
        </PanelBody>
      </Panel>
    </div>
  );
}

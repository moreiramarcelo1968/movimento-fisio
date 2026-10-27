import { ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-soft text-pine">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="font-display text-[26px] font-semibold text-ink">Sem conexão</h1>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-soft">
        O Movimento precisa de internet para carregar os dados da clínica. Verifique a rede e
        tente novamente.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-pine px-5 text-sm font-medium text-white transition hover:bg-pine-deep"
      >
        Tentar novamente
      </a>
      <div className="mt-12 opacity-60">
        <Brand showSubtitle={false} />
      </div>
    </div>
  );
}

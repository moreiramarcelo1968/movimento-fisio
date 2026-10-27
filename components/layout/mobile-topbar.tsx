import Link from "next/link";
import { Plus } from "lucide-react";
import { Brand } from "@/components/brand";
import { initials } from "@/lib/format";

export function MobileTopBar({ user }: { user: { name: string } }) {
  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur-lg sm:px-6 lg:hidden">
      <Link href="/" aria-label="Ir para o painel">
        <Brand showSubtitle={false} />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/atendimentos/novo"
          aria-label="Novo atendimento"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-white transition hover:bg-pine-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </Link>
        <Link
          href="/configuracoes"
          aria-label="Configurações"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-semibold text-pine"
        >
          {initials(user.name)}
        </Link>
      </div>
    </header>
  );
}

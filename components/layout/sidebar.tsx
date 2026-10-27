"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/atendimentos", label: "Atendimentos", icon: ClipboardList },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/tipos-atendimento", label: "Tipos de atendimento", icon: Tags },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  user,
  clinicName,
}: {
  user: { name: string; email: string };
  clinicName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col bg-pine-deep lg:flex">
      <div className="px-6 pt-7 pb-6">
        <Link href="/" aria-label="Ir para o painel">
          <Brand tone="cream" />
        </Link>
      </div>

      <div className="px-4">
        <Link
          href="/atendimentos/novo"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#f3f6f2] text-[14px] font-semibold text-pine-deep transition hover:bg-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Novo atendimento
        </Link>
      </div>

      <nav className="mt-7 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] transition",
                active
                  ? "bg-[#f3f6f2] font-semibold text-pine-deep"
                  : "text-[#c2d6cf] hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <Icon
                className={cn("h-[17px] w-[17px] shrink-0", active ? "text-pine" : "text-[#8fb3a8]")}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="mb-3 truncate px-1 text-[11px] text-[#8fb3a8]">{clinicName}</p>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[12px] font-semibold text-[#eaf2ee]">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#eaf2ee]">{user.name}</p>
            <p className="truncate text-[11.5px] text-[#8fb3a8]">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair do sistema"
              title="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8fb3a8] transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck2, FileBarChart2, Smartphone } from "lucide-react";
import { Brand } from "@/components/brand";
import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar conta",
};

const highlights = [
  { icon: CalendarCheck2, text: "Agenda com o status de cada sessão" },
  { icon: FileBarChart2, text: "Relatório por tipo de atendimento" },
  { icon: Smartphone, text: "Instale no celular e use na clínica" },
];

export default async function CadastroPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const db = await getDb();
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
  if (existingUsers.length > 0) redirect("/login");

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-pine-deep p-12 lg:flex">
        <svg
          aria-hidden="true"
          viewBox="0 0 400 400"
          fill="none"
          className="pointer-events-none absolute -right-28 top-1/2 h-[640px] w-[640px] -translate-y-1/2 text-[#14655a]"
        >
          {[70, 110, 150, 190].map((radius) => (
            <circle
              key={radius}
              cx="200"
              cy="200"
              r={radius}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={radius === 150 ? "12 8" : undefined}
            />
          ))}
          <circle cx="200" cy="200" r="26" fill="#D9A441" fillOpacity="0.85" />
          <circle cx="200" cy="200" r="48" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div className="relative">
          <Brand tone="cream" />
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-[44px] leading-[1.04] font-semibold tracking-[-0.03em] text-[#f4f7f3]">
            Primeira configuração
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[#a9c6bd]">
            Crie a conta do administrador para começar a usar o Movimento na sua clínica.
          </p>

          <ul className="mt-10 space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-center gap-3 text-[13px] text-[#c4d9d2]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] text-[#e5f0eb]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-[11.5px] text-[#7fa79c]">
          Movimento · gestão para fisioterapia
        </p>
      </div>

      <div className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>

          <h2 className="font-display text-[28px] font-semibold text-ink">Criar conta</h2>
          <p className="mt-1.5 mb-7 text-[14px] leading-relaxed text-ink-soft">
            Cadastre o primeiro usuário para acessar o sistema.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-[13px] text-ink-soft">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-pine hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

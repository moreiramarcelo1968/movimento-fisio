"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rust-soft text-rust">
        <TriangleAlert className="h-6 w-6" />
      </div>
      <h1 className="font-display text-[26px] font-semibold text-ink">
        Algo não saiu como esperado
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
        Não foi possível carregar esta tela agora. Tente novamente — se o problema
        continuar, verifique a conexão com a internet.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine px-4 text-sm font-medium text-white transition hover:bg-pine-deep"
        >
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink transition hover:bg-paper"
        >
          Ir para o painel
        </Link>
      </div>
    </div>
  );
}

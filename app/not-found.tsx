import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-soft text-pine">
        <Compass className="h-6 w-6" />
      </div>
      <p className="font-display text-[13px] font-semibold tracking-[0.16em] text-pine">
        404
      </p>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
        O endereço acessado não existe ou o registro foi removido. Volte para o
        painel e continue de onde parou.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-pine px-4 text-sm font-medium text-white transition hover:bg-pine-deep"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}

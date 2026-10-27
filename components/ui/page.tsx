import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ButtonLink } from "./button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-8",
        className,
      )}
    >
      <div className="max-w-2xl">
        <h1 className="font-display text-[26px] leading-[1.15] font-semibold text-ink sm:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const flashTones = {
  success: "border-pine/15 bg-pine-soft text-pine-deep",
  error: "border-rust/15 bg-rust-soft text-rust",
  info: "border-line bg-surface text-ink-soft",
} as const;

export function Flash({
  tone = "success",
  children,
}: {
  tone?: keyof typeof flashTones;
  children: ReactNode;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13.5px] font-medium",
        flashTones[tone],
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pine-soft text-pine">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-[17px] font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
      {action ? (
        <ButtonLink href={action.href} variant="secondary" size="sm" className="mt-5">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

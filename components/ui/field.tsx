import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClasses =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink shadow-[inset_0_1px_1px_rgba(20,32,29,0.02)] transition placeholder:text-ink-soft/60 focus:border-pine/60 focus:ring-4 focus:ring-pine/10 focus:outline-none disabled:bg-paper disabled:text-ink-soft";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(inputClasses, "h-auto min-h-[92px] resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(inputClasses, "cursor-pointer pr-9", className)} {...props}>
      {children}
    </select>
  );
}

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">
        {label}
        {required ? <span className="ml-0.5 text-rust">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] font-medium text-rust">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      className={cn(
        "rounded-xl px-3.5 py-2.5 text-[13px] font-medium",
        tone === "error" ? "bg-rust-soft text-rust" : "bg-pine-soft text-pine-deep",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

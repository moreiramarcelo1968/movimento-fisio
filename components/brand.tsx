import { cn } from "@/lib/utils";

export function Brand({
  className,
  tone = "pine",
  showSubtitle = true,
}: {
  className?: string;
  tone?: "pine" | "cream";
  showSubtitle?: boolean;
}) {
  const text = tone === "cream" ? "text-[#f3f6f2]" : "text-ink";
  const subtitle = tone === "cream" ? "text-[#9fc0b7]" : "text-ink-soft";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={cn("h-8 w-8 shrink-0", tone === "cream" ? "text-[#f3f6f2]" : "text-pine")}
      >
        <circle
          cx="16"
          cy="16"
          r="10.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="54 12"
          transform="rotate(-58 16 16)"
        />
        <circle cx="25.9" cy="16" r="3.3" fill="#D9A441" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[19px] font-semibold tracking-[-0.03em]", text)}>
          Movimento
        </span>
        {showSubtitle ? (
          <span className={cn("mt-1 text-[10.5px] tracking-[0.14em]", subtitle)}>
            FISIOTERAPIA
          </span>
        ) : null}
      </span>
    </span>
  );
}

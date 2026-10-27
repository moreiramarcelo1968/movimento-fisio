import { STATUS_META, type AppointmentStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
  withDot = true,
}: {
  status: string;
  className?: string;
  withDot?: boolean;
}) {
  const meta = STATUS_META[status as AppointmentStatus] ?? STATUS_META.scheduled;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap",
        meta.chip,
        className,
      )}
    >
      {withDot ? <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} /> : null}
      {meta.label}
    </span>
  );
}

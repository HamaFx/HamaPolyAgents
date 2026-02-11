import clsx from "clsx";

export function PipelineStatus({ status }: { status: string }) {
  const tone =
    status === "completed"
      ? "border-accentGreen/40 bg-accentGreen/10 text-accentGreen"
      : status === "failed"
        ? "border-accentRed/40 bg-accentRed/10 text-accentRed"
        : status === "vetoed"
          ? "border-accentYellow/40 bg-accentYellow/10 text-accentYellow"
          : "border-accentCyan/40 bg-accentCyan/10 text-accentCyan";

  return (
    <span className={clsx("inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs uppercase tracking-[0.14em]", tone)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

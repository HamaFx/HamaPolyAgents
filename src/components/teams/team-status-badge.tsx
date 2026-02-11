export function TeamStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] ${
        active
          ? "border-accentGreen/40 bg-accentGreen/10 text-accentGreen"
          : "border-accentRed/40 bg-accentRed/10 text-accentRed"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-accentGreen animate-pulseSoft" : "bg-accentRed"}`} />
      {active ? "Active" : "Paused"}
    </span>
  );
}

import { clamp } from "@/lib/utils";

interface ConfidenceBarProps {
  value: number;
  label?: string;
}

export function ConfidenceBar({ value, label }: ConfidenceBarProps) {
  const normalized = clamp(value, 0, 1);

  return (
    <div className="space-y-1">
      {label ? <p className="text-xs text-textSecondary">{label}</p> : null}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-bgInput">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accentRed via-accentYellow to-accentGreen"
          style={{ width: `${Math.round(normalized * 100)}%` }}
        />
      </div>
      <p className="text-right text-[11px] text-textMuted">{Math.round(normalized * 100)}%</p>
    </div>
  );
}

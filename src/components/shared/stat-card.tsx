import { ReactNode } from "react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
  icon?: ReactNode;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "border-border",
  positive: "border-accentGreen/40",
  negative: "border-accentRed/40",
  accent: "border-accentBlue/40"
};

export function StatCard({ label, value, hint, tone = "neutral", icon }: StatCardProps) {
  return (
    <article className={clsx("surface p-4", toneClasses[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-textMuted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{value}</p>
        </div>
        {icon ? <div className="text-textSecondary">{icon}</div> : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-textSecondary">{hint}</p> : null}
    </article>
  );
}

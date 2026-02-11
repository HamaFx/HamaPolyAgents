import { RiskManagerOutput } from "@/lib/ai/schemas/risk-manager-output";

export function RiskAssessmentCard({ risk }: { risk: RiskManagerOutput }) {
  return (
    <section className="surface p-4">
      <h3 className="headline text-lg">Risk Assessment</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-bgInput/40 p-3">
          <p className="text-xs text-textMuted">Decision</p>
          <p className="mt-1 text-sm text-textPrimary">{risk.decision}</p>
        </div>
        <div className="rounded-lg border border-border bg-bgInput/40 p-3">
          <p className="text-xs text-textMuted">Approved Amount</p>
          <p className="mt-1 text-sm text-textPrimary">${risk.approved_amount.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-bgInput/40 p-3">
          <p className="text-xs text-textMuted">Approved Size</p>
          <p className="mt-1 text-sm text-textPrimary">{risk.approved_size_pct.toFixed(2)}%</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-textSecondary">{risk.reasoning}</p>

      <div className="mt-3 space-y-2">
        {risk.risk_flags.map((flag) => (
          <div key={flag.flag} className="rounded-lg border border-border bg-bgInput/35 p-2 text-xs">
            <p className="text-textPrimary">{flag.flag}</p>
            <p className="text-textSecondary">{flag.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

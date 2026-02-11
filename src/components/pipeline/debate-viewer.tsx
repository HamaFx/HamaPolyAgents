import { AnalystOutput } from "@/lib/ai/schemas/analyst-output";
import { ConfidenceBar } from "@/components/shared/confidence-bar";

export function DebateViewer({ analysis }: { analysis: AnalystOutput }) {
  return (
    <section className="surface p-4">
      <h3 className="headline text-lg">Bull vs Bear Debate</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-accentGreen/35 bg-accentGreen/10 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-accentGreen">Bull Case</p>
          <p className="mt-2 text-sm text-textPrimary">{analysis.bull_case.argument}</p>
          <ul className="mt-2 space-y-1 text-xs text-textSecondary">
            {analysis.bull_case.key_points.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
          <div className="mt-2">
            <ConfidenceBar value={analysis.bull_case.confidence} label="Bull confidence" />
          </div>
        </article>

        <article className="rounded-xl border border-accentRed/35 bg-accentRed/10 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-accentRed">Bear Case</p>
          <p className="mt-2 text-sm text-textPrimary">{analysis.bear_case.argument}</p>
          <ul className="mt-2 space-y-1 text-xs text-textSecondary">
            {analysis.bear_case.key_points.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
          <div className="mt-2">
            <ConfidenceBar value={analysis.bear_case.confidence} label="Bear confidence" />
          </div>
        </article>
      </div>

      <article className="mt-3 rounded-xl border border-accentBlue/35 bg-accentBlue/10 p-3">
        <p className="text-xs uppercase tracking-[0.15em] text-accentBlue">Synthesis</p>
        <p className="mt-2 text-sm text-textPrimary">{analysis.synthesis.reasoning}</p>
        <p className="mt-2 text-xs text-textSecondary">
          Signal <span className="font-medium text-textPrimary">{analysis.synthesis.signal}</span> · Suggested size
          <span className="font-medium text-textPrimary"> {analysis.synthesis.suggested_size_pct.toFixed(2)}%</span>
        </p>
      </article>
    </section>
  );
}

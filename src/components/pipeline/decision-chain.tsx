import { AnalystOutput, analystOutputSchema } from "@/lib/ai/schemas/analyst-output";
import { ResearcherOutput, researcherOutputSchema } from "@/lib/ai/schemas/researcher-output";
import { RiskManagerOutput, riskManagerOutputSchema } from "@/lib/ai/schemas/risk-manager-output";
import { AgentOutput, PipelineRun } from "@/types";
import { AgentOutputCard } from "@/components/pipeline/agent-output-card";
import { DebateViewer } from "@/components/pipeline/debate-viewer";
import { PipelineStatus } from "@/components/pipeline/pipeline-status";
import { PipelineTimeline } from "@/components/pipeline/pipeline-timeline";
import { RiskAssessmentCard } from "@/components/pipeline/risk-assessment-card";

interface DecisionChainProps {
  run: PipelineRun;
  outputs: AgentOutput[];
}

function parseOutput<T>(payload: Record<string, unknown>, parser: (input: unknown) => T): T | null {
  try {
    return parser(payload);
  } catch {
    return null;
  }
}

export function DecisionChain({ run, outputs }: DecisionChainProps) {
  const research = parseOutput<ResearcherOutput>(
    outputs.find((o) => o.agentRole === "researcher")?.outputData ?? {},
    (value) => researcherOutputSchema.parse(value)
  );
  const analysis = parseOutput<AnalystOutput>(
    outputs.find((o) => o.agentRole === "analyst")?.outputData ?? {},
    (value) => analystOutputSchema.parse(value)
  );
  const risk = parseOutput<RiskManagerOutput>(
    outputs.find((o) => o.agentRole === "risk_manager")?.outputData ?? {},
    (value) => riskManagerOutputSchema.parse(value)
  );

  return (
    <section className="space-y-4">
      <article className="surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="headline text-2xl">Run {run.id.slice(0, 8)}</h2>
            <p className="text-xs text-textSecondary">Full decision chain and agent outputs</p>
          </div>
          <PipelineStatus status={run.status} />
        </div>
      </article>

      <PipelineTimeline outputs={outputs} />

      {research ? (
        <section className="surface p-4">
          <h3 className="headline text-lg">Research Snapshot</h3>
          <p className="mt-2 text-sm text-textSecondary">{research.market_summary}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {research.key_factors.map((factor) => (
              <article key={factor.factor} className="rounded-lg border border-border bg-bgInput/35 p-2">
                <p className="text-xs text-textPrimary">{factor.factor}</p>
                <p className="text-[11px] text-textSecondary">
                  {factor.impact} · Importance {(factor.importance * 100).toFixed(0)}%
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {analysis ? <DebateViewer analysis={analysis} /> : null}
      {risk ? <RiskAssessmentCard risk={risk} /> : null}

      <section className="space-y-3">
        {outputs.map((output) => (
          <AgentOutputCard key={output.id} output={output} />
        ))}
      </section>
    </section>
  );
}

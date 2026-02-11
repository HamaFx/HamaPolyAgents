import { AgentOutput } from "@/types";

export function PipelineTimeline({ outputs }: { outputs: AgentOutput[] }) {
  return (
    <section className="surface p-4">
      <h3 className="headline text-lg">Pipeline Timeline</h3>
      <div className="mt-4 space-y-2">
        {outputs.map((output, index) => (
          <div key={output.id} className="relative rounded-lg border border-border bg-bgInput/35 p-3 pl-10">
            <span className="absolute left-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accentBlue/25 text-xs text-textPrimary">
              {index + 1}
            </span>
            <p className="text-sm text-textPrimary">{output.agentRole.replace("_", " ")}</p>
            <p className="text-xs text-textSecondary">
              {output.status} · {output.latencyMs}ms · {output.tokensUsed} tokens
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

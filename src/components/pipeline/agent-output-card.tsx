import { AgentOutput } from "@/types";
import { formatDateTime } from "@/lib/format";

export function AgentOutputCard({ output }: { output: AgentOutput }) {
  return (
    <article className="surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="headline text-lg">{output.agentRole.replace("_", " ")}</h4>
        <span className="text-xs text-textMuted">{formatDateTime(output.createdAt)}</span>
      </div>

      <p className="text-sm text-textSecondary">{output.reasoning}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-bgInput/40 p-2">
          <p className="text-textMuted">Status</p>
          <p className="mt-1 text-textPrimary">{output.status}</p>
        </div>
        <div className="rounded-lg border border-border bg-bgInput/40 p-2">
          <p className="text-textMuted">Tokens</p>
          <p className="mt-1 text-textPrimary">{output.tokensUsed}</p>
        </div>
        <div className="rounded-lg border border-border bg-bgInput/40 p-2">
          <p className="text-textMuted">Latency</p>
          <p className="mt-1 text-textPrimary">{output.latencyMs}ms</p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-border bg-bgInput/35 p-3 text-xs">
        <summary className="cursor-pointer text-textSecondary">View structured output</summary>
        <pre className="mt-2 overflow-x-auto text-[11px] text-textSecondary">{JSON.stringify(output.outputData, null, 2)}</pre>
      </details>
    </article>
  );
}

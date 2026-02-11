import { AgentConfig } from "@/types";

export function AgentConfigPanel({ configs }: { configs: AgentConfig[] }) {
  return (
    <section className="surface p-4">
      <h3 className="headline text-lg">Agent Configuration</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {configs.map((config) => (
          <article key={config.id} className="rounded-lg border border-border bg-bgInput/35 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-textMuted">{config.agentRole.replace("_", " ")}</p>
            <p className="mt-1 text-xs text-textSecondary">
              Model: <span className="text-textPrimary">{config.modelOverride ?? "default"}</span>
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-bgPrimary/60 p-2 text-[11px] text-textSecondary">
              {JSON.stringify(config.config, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}

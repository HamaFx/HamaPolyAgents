import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { AgentConfigPanel } from "@/components/teams/agent-config-panel";
import { RunTeamButton } from "@/components/teams/run-team-button";
import { TeamStatusBadge } from "@/components/teams/team-status-badge";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { getTeamDetail } from "@/lib/store/memory";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params;
  const team = getTeamDetail(id);

  if (!team) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <article className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="headline text-3xl">{team.name}</h1>
            <p className="mt-1 text-sm text-textSecondary">{team.strategyPrompt}</p>
          </div>
          <TeamStatusBadge active={team.isActive} />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-bgInput/40 p-2">
            <p className="text-xs text-textMuted">Bankroll</p>
            <p className="text-sm text-textPrimary">{formatCurrency(team.bankroll)}</p>
          </div>
          <div className="rounded-lg border border-border bg-bgInput/40 p-2">
            <p className="text-xs text-textMuted">PnL</p>
            <p className={`text-sm ${team.performance.totalPnl >= 0 ? "text-accentGreen" : "text-accentRed"}`}>
              {formatCurrency(team.performance.totalPnl)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bgInput/40 p-2">
            <p className="text-xs text-textMuted">ROI</p>
            <p className="text-sm text-textPrimary">{formatPercent(team.performance.roiPct)}</p>
          </div>
          <div className="rounded-lg border border-border bg-bgInput/40 p-2">
            <p className="text-xs text-textMuted">Win Rate</p>
            <p className="text-sm text-textPrimary">{team.performance.winRate.toFixed(2)}%</p>
          </div>
        </div>

        <div className="mt-4">
          <RunTeamButton teamId={team.id} />
        </div>
      </article>

      <AgentConfigPanel configs={team.configs} />

      <section className="surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="headline text-xl">Recent Pipeline Runs</h2>
          <span className="text-xs text-textMuted">Latest {team.recentRuns.length}</span>
        </div>

        <div className="space-y-2">
          {team.recentRuns.length === 0 ? (
            <p className="text-sm text-textSecondary">No pipeline runs yet.</p>
          ) : (
            team.recentRuns.map((run) => (
              <Link
                key={run.id}
                href={`/teams/${team.id}/runs/${run.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bgInput/35 px-3 py-2"
              >
                <span className="text-sm text-textPrimary">Run {run.id.slice(0, 8)}</span>
                <span className="inline-flex items-center gap-1 text-xs text-textSecondary">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDateTime(run.startedAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </section>
  );
}

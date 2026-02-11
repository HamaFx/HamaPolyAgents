import Link from "next/link";
import { Activity, ArrowUpRight, Wallet } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TeamWithMeta } from "@/types";
import { TeamStatusBadge } from "@/components/teams/team-status-badge";

export function TeamCard({ team }: { team: TeamWithMeta }) {
  const pnlPositive = team.performance.totalPnl >= 0;

  return (
    <article className="surface surface-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="headline text-xl">{team.name}</h3>
          <p className="mt-1 text-xs text-textSecondary">{team.riskProfile} risk profile</p>
        </div>
        <TeamStatusBadge active={team.isActive} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-textSecondary">{team.strategyPrompt}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-bgInput/40 p-2">
          <p className="text-textMuted">Bankroll</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-textPrimary">
            <Wallet className="h-3.5 w-3.5" /> {formatCurrency(team.bankroll)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-bgInput/40 p-2">
          <p className="text-textMuted">ROI</p>
          <p className={`mt-1 text-sm ${pnlPositive ? "text-accentGreen" : "text-accentRed"}`}>
            {formatPercent(team.performance.roiPct)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs text-textMuted">
          <Activity className="h-3.5 w-3.5" />
          {team.recentRuns.length} runs
        </span>
        <Link href={`/teams/${team.id}`} className="inline-flex items-center gap-1 text-xs text-accentBlue hover:text-white">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

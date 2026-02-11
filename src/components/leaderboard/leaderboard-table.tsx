import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AgentTeam, TeamPerformance } from "@/types";

interface LeaderboardEntry {
  team: AgentTeam;
  performance: TeamPerformance;
}

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="headline text-2xl">Global Leaderboard</h2>
        <p className="text-xs text-textMuted">Ranked by total PnL</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-textMuted">
            <tr>
              <th className="px-2 py-2">Rank</th>
              <th className="px-2 py-2">Team</th>
              <th className="px-2 py-2">Risk</th>
              <th className="px-2 py-2">PnL</th>
              <th className="px-2 py-2">ROI</th>
              <th className="px-2 py-2">Win Rate</th>
              <th className="px-2 py-2">Brier</th>
              <th className="px-2 py-2">RAR</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.team.id} className="border-t border-border/70 text-textSecondary">
                <td className="px-2 py-2 text-textPrimary">#{index + 1}</td>
                <td className="px-2 py-2">
                  <Link href={`/teams/${entry.team.id}`} className="text-textPrimary hover:text-accentBlue">
                    {entry.team.name}
                  </Link>
                </td>
                <td className="px-2 py-2">{entry.team.riskProfile}</td>
                <td className={`px-2 py-2 ${entry.performance.totalPnl >= 0 ? "text-accentGreen" : "text-accentRed"}`}>
                  {formatCurrency(entry.performance.totalPnl)}
                </td>
                <td className="px-2 py-2">{entry.performance.roiPct.toFixed(2)}%</td>
                <td className="px-2 py-2">{entry.performance.winRate.toFixed(2)}%</td>
                <td className="px-2 py-2">{entry.performance.brierScore.toFixed(3)}</td>
                <td className="px-2 py-2">{entry.performance.riskAdjustedReturn.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

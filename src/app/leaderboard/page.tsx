import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { getLeaderboard } from "@/lib/store/memory";

export default function LeaderboardPage() {
  const entries = getLeaderboard();

  return (
    <section className="space-y-4">
      <article className="surface p-5">
        <h1 className="headline text-3xl">Leaderboard</h1>
        <p className="mt-1 text-sm text-textSecondary">Rankings by PnL, ROI, prediction quality, and risk-adjusted return.</p>
      </article>

      <LeaderboardTable entries={entries} />
    </section>
  );
}

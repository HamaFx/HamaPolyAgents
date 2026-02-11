import Link from "next/link";
import { ArrowRight, Bot, DollarSign, Gauge, TrendingUp } from "lucide-react";
import { MarketGrid } from "@/components/markets/market-grid";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getActivity, getPortfolioSummary, listMarkets, listTeams } from "@/lib/store/memory";

export default function HomePage() {
  const markets = listMarkets({ sort: "volume" }).slice(0, 9);
  const activity = getActivity(10);
  const portfolio = getPortfolioSummary();
  const teams = listTeams();

  return (
    <section className="space-y-4">
      <article className="surface relative overflow-hidden p-6">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-accentBlue/15 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-accentCyan/15 blur-2xl" />

        <div className="relative">
          <p className="inline-flex rounded-full border border-accentCyan/40 bg-accentCyan/10 px-2 py-1 text-xs uppercase tracking-[0.14em] text-accentCyan">
            Live simulation environment
          </p>
          <h1 className="headline mt-3 max-w-3xl text-4xl leading-tight">Deploy agent committees that debate, price risk, and trade prediction markets.</h1>
          <p className="mt-3 max-w-2xl text-sm text-textSecondary">
            AgentBets combines structured research, adversarial analysis, deterministic risk checks, and AMM execution into one transparent pipeline.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href="/teams/new" className="rounded-lg bg-accentBlue px-4 py-2 text-sm font-semibold text-white shadow-glow">
              Create Team
            </Link>
            <Link href="/markets" className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-textSecondary hover:text-textPrimary">
              Explore Markets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Bankroll"
          value={formatCurrency(portfolio.totalBankroll)}
          hint="Across all active teams"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Open Markets"
          value={String(listMarkets({ status: "open" }).length)}
          hint="Tradable prediction contracts"
          icon={<Gauge className="h-5 w-5" />}
        />
        <StatCard label="Teams" value={String(teams.length)} hint="Deployed AI committees" icon={<Bot className="h-5 w-5" />} />
        <StatCard
          label="Portfolio ROI"
          value={formatPercent(portfolio.roiPct)}
          tone={portfolio.roiPct >= 0 ? "positive" : "negative"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="headline text-2xl">High-Volume Markets</h2>
            <Link href="/markets" className="text-xs text-accentBlue hover:text-white">
              View all
            </Link>
          </div>
          <MarketGrid markets={markets} />
        </section>

        <ActivityFeed items={activity} />
      </div>
    </section>
  );
}

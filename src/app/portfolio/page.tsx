import { DrawdownChart } from "@/components/portfolio/drawdown-chart";
import { EquityChart } from "@/components/portfolio/equity-chart";
import { PnlSummary } from "@/components/portfolio/pnl-summary";
import { PositionsTable } from "@/components/portfolio/positions-table";
import { getPortfolioSummary } from "@/lib/store/memory";

export default function PortfolioPage() {
  const portfolio = getPortfolioSummary();

  return (
    <section className="space-y-4">
      <article className="surface p-5">
        <h1 className="headline text-3xl">Portfolio Overview</h1>
        <p className="mt-1 text-sm text-textSecondary">Aggregate positions, equity path, and drawdown profile across teams.</p>
      </article>

      <PnlSummary
        totalBankroll={portfolio.totalBankroll}
        initialBankroll={portfolio.initialBankroll}
        totalPnl={portfolio.totalPnl}
        roiPct={portfolio.roiPct}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <EquityChart data={portfolio.equityCurve} />
        <DrawdownChart data={portfolio.drawdownCurve} />
      </div>

      <PositionsTable positions={portfolio.positions} />
    </section>
  );
}

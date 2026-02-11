import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";

interface PnlSummaryProps {
  totalBankroll: number;
  initialBankroll: number;
  totalPnl: number;
  roiPct: number;
}

export function PnlSummary({ totalBankroll, initialBankroll, totalPnl, roiPct }: PnlSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Current Bankroll"
        value={formatCurrency(totalBankroll)}
        hint="Aggregate across all teams"
        icon={<Wallet className="h-5 w-5" />}
      />
      <StatCard label="Initial Capital" value={formatCurrency(initialBankroll)} hint="Start of simulation" />
      <StatCard
        label="Total PnL"
        value={formatCurrency(totalPnl)}
        tone={totalPnl >= 0 ? "positive" : "negative"}
        icon={totalPnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
      />
      <StatCard label="ROI" value={formatPercent(roiPct)} tone={roiPct >= 0 ? "positive" : "negative"} />
    </div>
  );
}

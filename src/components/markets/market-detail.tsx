import { formatDate } from "@/lib/format";
import { Market, PriceHistoryPoint, Trade } from "@/types";
import { OddsChart } from "@/components/markets/odds-chart";
import { TradeForm } from "@/components/markets/trade-form";

interface MarketDetailProps {
  market: Market;
  priceHistory: PriceHistoryPoint[];
  recentTrades: Trade[];
  teamId?: string;
}

export function MarketDetail({ market, priceHistory, recentTrades, teamId }: MarketDetailProps) {
  return (
    <section className="space-y-4">
      <article className="surface p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-border px-2 py-1 text-xs uppercase tracking-[0.14em] text-textSecondary">
            {market.category}
          </span>
          <span className="text-xs text-textMuted">Resolves {formatDate(market.resolutionDate)}</span>
        </div>
        <h1 className="headline text-3xl leading-tight">{market.question}</h1>
        <p className="mt-3 text-sm text-textSecondary">{market.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
          <div className="rounded-lg border border-accentGreen/40 bg-accentGreen/10 p-3">
            <p className="text-[11px] text-accentGreen">YES</p>
            <p className="text-2xl font-semibold text-accentGreen">{market.currentYesPrice.toFixed(2)}c</p>
          </div>
          <div className="rounded-lg border border-accentRed/40 bg-accentRed/10 p-3">
            <p className="text-[11px] text-accentRed">NO</p>
            <p className="text-2xl font-semibold text-accentRed">{market.currentNoPrice.toFixed(2)}c</p>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <OddsChart data={priceHistory} />

          <section className="surface p-4">
            <h3 className="headline text-lg">Recent Trades</h3>
            <div className="mt-3 space-y-2">
              {recentTrades.length === 0 ? (
                <p className="text-sm text-textSecondary">No recent trades.</p>
              ) : (
                recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between rounded-lg border border-border bg-bgInput/45 px-3 py-2">
                    <span className="text-xs text-textSecondary">{trade.side.toUpperCase()}</span>
                    <span className="text-xs text-textPrimary">{trade.shares.toFixed(2)} shares</span>
                    <span className="text-xs text-textMuted">{trade.price.toFixed(2)}c</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <TradeForm marketId={market.id} teamId={teamId} yesPrice={market.currentYesPrice} noPrice={market.currentNoPrice} />
      </div>
    </section>
  );
}

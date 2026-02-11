import { Market } from "@/types";
import { MarketCard } from "@/components/markets/market-card";

export function MarketGrid({ markets }: { markets: Market[] }) {
  if (markets.length === 0) {
    return (
      <div className="surface p-6 text-center text-sm text-textSecondary">
        No markets matched this filter.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}

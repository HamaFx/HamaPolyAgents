import { CategoryFilter } from "@/components/markets/category-filter";
import { MarketGrid } from "@/components/markets/market-grid";
import { listMarketCategories, listMarkets } from "@/lib/store/memory";

interface MarketsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function MarketsPage({ searchParams }: MarketsPageProps) {
  const params = await searchParams;
  const categories = listMarketCategories();
  const markets = listMarkets({
    category: (params.category as (typeof categories)[number]) ?? undefined,
    sort: "volume"
  });

  return (
    <section className="space-y-4">
      <article className="surface p-5">
        <h1 className="headline text-3xl">Market Explorer</h1>
        <p className="mt-2 text-sm text-textSecondary">Filter by category and inspect live probability curves.</p>
        <div className="mt-3">
          <CategoryFilter categories={categories} />
        </div>
      </article>

      <MarketGrid markets={markets} />
    </section>
  );
}

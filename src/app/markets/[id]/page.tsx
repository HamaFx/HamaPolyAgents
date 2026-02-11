import { notFound } from "next/navigation";
import { MarketDetail } from "@/components/markets/market-detail";
import { getMarketDetail, listTeams } from "@/lib/store/memory";

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { id } = await params;
  const detail = getMarketDetail(id);
  if (!detail) {
    notFound();
  }

  const defaultTeam = listTeams()[0];

  return (
    <MarketDetail
      market={detail.market}
      priceHistory={detail.priceHistory}
      recentTrades={detail.recentTrades}
      teamId={defaultTeam?.id}
    />
  );
}

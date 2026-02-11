import { listMarkets } from "@/lib/store/memory";
import { MarketCategory } from "@/types";
import { ok } from "@/app/api/_shared";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as MarketCategory | null;
  const status = searchParams.get("status") as "open" | "closed" | "resolved" | null;
  const sort = searchParams.get("sort") as "volume" | "newest" | "yesPrice" | null;
  const search = searchParams.get("search") ?? undefined;

  const markets = listMarkets({
    category: category ?? undefined,
    status: status ?? undefined,
    sort: sort ?? undefined,
    search
  });

  return ok(markets);
}

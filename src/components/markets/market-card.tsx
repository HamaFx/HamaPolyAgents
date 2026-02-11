import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { formatDate, formatPriceCents } from "@/lib/format";
import { Market } from "@/types";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const edgeTone = market.currentYesPrice >= 50 ? "text-accentGreen" : "text-accentRed";

  return (
    <Link href={`/markets/${market.id}`} className="group block">
      <article className="surface surface-hover h-full p-4 transition group-hover:-translate-y-0.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-[0.15em] text-textMuted">
            {market.category}
          </span>
          <span className="text-xs text-textMuted">Resolves {formatDate(market.resolutionDate)}</span>
        </div>

        <h3 className="min-h-[2.8rem] text-sm font-medium leading-6 text-textPrimary">{market.question}</h3>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-accentGreen/30 bg-accentGreen/8 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-accentGreen">YES</p>
            <p className="text-lg font-semibold text-accentGreen">{formatPriceCents(market.currentYesPrice)}</p>
          </div>
          <div className="rounded-lg border border-accentRed/30 bg-accentRed/8 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-accentRed">NO</p>
            <p className="text-lg font-semibold text-accentRed">{formatPriceCents(market.currentNoPrice)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-textSecondary">Vol {market.volume.toLocaleString()}</span>
          <span className={clsx("inline-flex items-center gap-1", edgeTone)}>
            Explore <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}

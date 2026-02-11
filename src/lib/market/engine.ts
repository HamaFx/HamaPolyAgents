import { executeBuyNo, executeBuyYes, getPrices, PoolState } from "@/lib/market/pricing";
import { MarketSide } from "@/types";

const INITIAL_LIQUIDITY = 1000;

export interface MarketEngineInput {
  side: MarketSide;
  amount: number;
  currentYesPrice: number;
  currentNoPrice: number;
}

export interface MarketEngineResult {
  shares: number;
  avgPrice: number;
  priceImpact: number;
  yesPrice: number;
  noPrice: number;
}

function poolsFromPrices(yesPrice: number, noPrice: number): PoolState {
  // Derive virtual pools proportional to quoted prices, anchored to fixed liquidity.
  const safeYes = Math.max(0.1, Math.min(99.9, yesPrice));
  const safeNo = Math.max(0.1, Math.min(99.9, noPrice));
  const yesPool = (safeNo / 100) * INITIAL_LIQUIDITY;
  const noPool = (safeYes / 100) * INITIAL_LIQUIDITY;
  return {
    yesPool,
    noPool
  };
}

export function executeMarketTrade(input: MarketEngineInput): MarketEngineResult {
  const state = poolsFromPrices(input.currentYesPrice, input.currentNoPrice);
  const execution = input.side === "yes" ? executeBuyYes(state, input.amount) : executeBuyNo(state, input.amount);
  const prices = getPrices(execution.nextState);

  return {
    shares: execution.shares,
    avgPrice: execution.avgPrice,
    priceImpact: execution.priceImpact,
    yesPrice: prices.yes,
    noPrice: prices.no
  };
}

import { clamp, round } from "@/lib/utils";

export interface PoolState {
  yesPool: number;
  noPool: number;
}

export interface TradeExecution {
  shares: number;
  avgPrice: number;
  priceImpact: number;
  nextState: PoolState;
}

export function getPrices(state: PoolState): { yes: number; no: number } {
  const total = state.yesPool + state.noPool;
  if (total <= 0) {
    return { yes: 50, no: 50 };
  }
  const yes = (state.noPool / total) * 100;
  const no = (state.yesPool / total) * 100;
  return { yes: round(yes, 2), no: round(no, 2) };
}

export function executeBuyYes(state: PoolState, amount: number): TradeExecution {
  const tradeAmount = Math.max(0.01, amount);
  const k = state.yesPool * state.noPool;
  const oldPrice = getPrices(state).yes;

  const nextNo = state.noPool + tradeAmount;
  const nextYes = k / nextNo;
  const shares = state.yesPool - nextYes;

  const avgPrice = (tradeAmount / shares) * 100;
  const nextState = {
    yesPool: clamp(nextYes, 0.0001, Number.MAX_SAFE_INTEGER),
    noPool: nextNo
  };
  const newPrice = getPrices(nextState).yes;

  return {
    shares: round(shares, 4),
    avgPrice: round(avgPrice, 2),
    priceImpact: round(newPrice - oldPrice, 2),
    nextState
  };
}

export function executeBuyNo(state: PoolState, amount: number): TradeExecution {
  const tradeAmount = Math.max(0.01, amount);
  const k = state.yesPool * state.noPool;
  const oldPrice = getPrices(state).no;

  const nextYes = state.yesPool + tradeAmount;
  const nextNo = k / nextYes;
  const shares = state.noPool - nextNo;

  const avgPrice = (tradeAmount / shares) * 100;
  const nextState = {
    yesPool: nextYes,
    noPool: clamp(nextNo, 0.0001, Number.MAX_SAFE_INTEGER)
  };
  const newPrice = getPrices(nextState).no;

  return {
    shares: round(shares, 4),
    avgPrice: round(avgPrice, 2),
    priceImpact: round(newPrice - oldPrice, 2),
    nextState
  };
}

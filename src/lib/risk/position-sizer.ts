import { clamp } from "@/lib/utils";

interface PositionSizeInput {
  edge: number;
  confidence: number;
  oddsDecimal: number;
  bankroll: number;
  maxSingleBetPct: number;
}

export function computePositionSize(input: PositionSizeInput): number {
  const safeOdds = Math.max(input.oddsDecimal, 1.01);
  const kellyFraction = clamp((input.edge * input.confidence) / safeOdds, 0, 1);
  const halfKelly = kellyFraction / 2;
  const maxSingleBet = (input.maxSingleBetPct / 100) * input.bankroll;
  return Math.max(0, Math.min(halfKelly * input.bankroll, maxSingleBet));
}

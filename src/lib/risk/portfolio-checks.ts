import { getRiskProfile } from "@/lib/risk/profiles";
import { pct } from "@/lib/utils";
import { AgentTeam, Market, Position, RiskProfileName } from "@/types";

interface PortfolioCheckInput {
  riskProfile: RiskProfileName;
  team: AgentTeam;
  market: Market;
  positions: Position[];
  amount: number;
  confidence: number;
}

export interface PortfolioCheckResult {
  approved: boolean;
  reasons: string[];
  reducedAmount?: number;
}

export function runPortfolioChecks(input: PortfolioCheckInput): PortfolioCheckResult {
  const profile = getRiskProfile(input.riskProfile);
  const reasons: string[] = [];

  if (input.amount > input.team.bankroll) {
    reasons.push("Insufficient bankroll for requested trade size.");
  }

  const currentPositionExposure = input.positions
    .filter((p) => p.marketId === input.market.id && p.status === "open")
    .reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
  const newPositionExposure = currentPositionExposure + input.amount;

  if (pct(newPositionExposure, input.team.bankroll) > profile.maxPositionPct) {
    reasons.push("Position size exceeds max exposure per market.");
  }

  const categoryExposure = input.positions
    .filter((p) => p.status === "open")
    .reduce((sum, p) => {
      if (p.marketId !== input.market.id) {
        return sum;
      }
      return sum + p.shares * p.avgPrice;
    }, 0);

  if (pct(categoryExposure + input.amount, input.team.bankroll) > profile.maxCategoryExposurePct) {
    reasons.push("Category concentration limit exceeded.");
  }

  const drawdownPct = pct(input.team.initialBankroll - input.team.bankroll, input.team.initialBankroll);
  if (drawdownPct > profile.drawdownPauseThresholdPct) {
    reasons.push("Drawdown threshold breached; trading should be paused.");
  }

  if (input.confidence < profile.minConfidence) {
    reasons.push("Signal confidence below minimum threshold.");
  }

  const openPositions = input.positions.filter((p) => p.status === "open").length;
  if (openPositions >= profile.maxConcurrentPositions) {
    reasons.push("Max concurrent positions reached.");
  }

  if (reasons.length === 0) {
    return { approved: true, reasons };
  }

  const maxSingleAmount = (profile.maxSingleBetPct / 100) * input.team.bankroll;
  if (input.amount > maxSingleAmount && maxSingleAmount > 0 && reasons.length <= 2) {
    return {
      approved: true,
      reasons,
      reducedAmount: maxSingleAmount
    };
  }

  return { approved: false, reasons };
}

import { getRiskProfile } from "@/lib/risk/profiles";
import { getMarketById, getPositionsForTeam, getTeamById, listTrades } from "@/lib/store/memory";
import { Position } from "@/types";

export interface SemanticAnchor {
  teamName: string;
  teamStrategy: string;
  riskProfile: ReturnType<typeof getRiskProfile>;
  currentBankroll: number;
  initialBankroll: number;
  pnlPercent: number;
  openPositions: Position[];
  categoryExposure: Record<string, number>;
  market: NonNullable<ReturnType<typeof getMarketById>>;
  recentTrades: ReturnType<typeof listTrades>;
  maxBetPercent: number;
  maxPositionPercent: number;
  maxCategoryExposure: number;
  drawdownPauseThreshold: number;
  minConfidence: number;
}

export function buildSemanticAnchor(teamId: string, marketId: string): SemanticAnchor {
  const team = getTeamById(teamId);
  if (!team) {
    throw new Error("Team not found.");
  }
  const market = getMarketById(marketId);
  if (!market) {
    throw new Error("Market not found.");
  }

  const risk = getRiskProfile(team.riskProfile);
  const positions = getPositionsForTeam(teamId).filter((position) => position.status === "open");
  const categoryExposure = positions.reduce<Record<string, number>>((acc, position) => {
    const exposure = position.shares * position.avgPrice;
    acc[market.category] = (acc[market.category] ?? 0) + exposure;
    return acc;
  }, {});

  return {
    teamName: team.name,
    teamStrategy: team.strategyPrompt,
    riskProfile: risk,
    currentBankroll: team.bankroll,
    initialBankroll: team.initialBankroll,
    pnlPercent: team.initialBankroll > 0 ? ((team.bankroll - team.initialBankroll) / team.initialBankroll) * 100 : 0,
    openPositions: positions,
    categoryExposure,
    market,
    recentTrades: listTrades({ marketId, limit: 10 }),
    maxBetPercent: risk.maxSingleBetPct,
    maxPositionPercent: risk.maxPositionPct,
    maxCategoryExposure: risk.maxCategoryExposurePct,
    drawdownPauseThreshold: risk.drawdownPauseThresholdPct,
    minConfidence: risk.minConfidence
  };
}

import { RiskProfileName } from "@/types";

export interface RiskProfile {
  maxSingleBetPct: number;
  maxPositionPct: number;
  maxCategoryExposurePct: number;
  drawdownPauseThresholdPct: number;
  minConfidence: number;
  maxConcurrentPositions: number;
  debateRounds: number;
}

export const RISK_PROFILES: Record<RiskProfileName, RiskProfile> = {
  conservative: {
    maxSingleBetPct: 3,
    maxPositionPct: 10,
    maxCategoryExposurePct: 25,
    drawdownPauseThresholdPct: 8,
    minConfidence: 0.75,
    maxConcurrentPositions: 5,
    debateRounds: 3
  },
  moderate: {
    maxSingleBetPct: 8,
    maxPositionPct: 20,
    maxCategoryExposurePct: 40,
    drawdownPauseThresholdPct: 15,
    minConfidence: 0.6,
    maxConcurrentPositions: 10,
    debateRounds: 2
  },
  aggressive: {
    maxSingleBetPct: 15,
    maxPositionPct: 35,
    maxCategoryExposurePct: 60,
    drawdownPauseThresholdPct: 25,
    minConfidence: 0.45,
    maxConcurrentPositions: 20,
    debateRounds: 1
  }
};

export function getRiskProfile(name: RiskProfileName): RiskProfile {
  return RISK_PROFILES[name] ?? RISK_PROFILES.moderate;
}

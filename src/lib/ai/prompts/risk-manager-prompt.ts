import { AnalystOutput } from "@/lib/ai/schemas/analyst-output";
import { SemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";

export function buildRiskManagerPrompt(anchor: SemanticAnchor, analysis: AnalystOutput): string {
  return JSON.stringify(
    {
      objective: "Assess trade against risk constraints. Approve/reduce/veto.",
      portfolio_state: {
        bankroll: anchor.currentBankroll,
        pnl_percent: anchor.pnlPercent,
        open_positions: anchor.openPositions,
        category_exposure: anchor.categoryExposure
      },
      limits: {
        max_bet_percent: anchor.maxBetPercent,
        max_position_percent: anchor.maxPositionPercent,
        max_category_exposure: anchor.maxCategoryExposure,
        drawdown_pause_threshold: anchor.drawdownPauseThreshold,
        min_confidence: anchor.minConfidence
      },
      analysis
    },
    null,
    2
  );
}

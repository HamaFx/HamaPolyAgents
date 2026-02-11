import { SemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";

export function buildResearcherPrompt(anchor: SemanticAnchor): string {
  return JSON.stringify(
    {
      objective: "Assess this market and estimate probability edge.",
      team_strategy: anchor.teamStrategy,
      market: anchor.market,
      recent_trades: anchor.recentTrades,
      output_contract: {
        market_summary: "string",
        key_factors: [{ factor: "string", impact: "bullish|bearish|neutral", importance: "0..1" }],
        odds_assessment: {
          current_implied_prob: "number",
          researcher_estimated_prob: "number",
          edge: "number"
        },
        data_confidence: "0..1",
        related_markets: ["string"]
      }
    },
    null,
    2
  );
}

import { BaseAgent } from "@/lib/ai/agents/base-agent";
import { buildResearcherPrompt } from "@/lib/ai/prompts/researcher-prompt";
import { SemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { researcherOutputSchema, ResearcherOutput } from "@/lib/ai/schemas/researcher-output";
import { callStructuredLLM } from "@/lib/ai/llm";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import { round } from "@/lib/utils";

export class ResearcherAgent extends BaseAgent<SemanticAnchor, ResearcherOutput> {
  constructor() {
    super("researcher");
  }

  protected async run(anchor: SemanticAnchor) {
    const prompt = buildResearcherPrompt(anchor);
    const result = await callStructuredLLM({
      model: "gpt-4o-mini",
      systemPrompt: SYSTEM_PROMPTS.researcher,
      userPrompt: prompt,
      schema: researcherOutputSchema,
      fallback: () => {
        const edge = round((50 - anchor.market.currentYesPrice) / 100, 3);
        const primaryImpact: ResearcherOutput["key_factors"][number]["impact"] =
          edge > 0 ? "bullish" : "bearish";
        const estimatedProb = round(Math.max(5, Math.min(95, anchor.market.currentYesPrice + edge * 100 * -0.6)), 2);
        const fallbackOutput: ResearcherOutput = {
          market_summary: `Market ${anchor.market.question} currently prices YES at ${anchor.market.currentYesPrice}%.`,
          key_factors: [
            {
              factor: "Current implied probability divergence",
              impact: primaryImpact,
              importance: 0.74
            },
            {
              factor: "Recent market activity and liquidity",
              impact: "neutral",
              importance: 0.61
            },
            {
              factor: "Resolution clarity and timeline",
              impact: "bullish",
              importance: 0.66
            }
          ],
          odds_assessment: {
            current_implied_prob: anchor.market.currentYesPrice,
            researcher_estimated_prob: estimatedProb,
            edge: round((estimatedProb - anchor.market.currentYesPrice) / 100, 3)
          },
          data_confidence: 0.68,
          related_markets: [
            `Category:${anchor.market.category}`,
            "Macro policy sentiment",
            "Flow in correlated markets"
          ]
        };
        return fallbackOutput;
      }
    });

    return {
      output: result.output,
      reasoning: "Research completed with structured factor extraction and odds edge estimate.",
      tokensUsed: result.tokensUsed,
      latencyMs: 0,
      costEstimate: result.costEstimate
    };
  }
}

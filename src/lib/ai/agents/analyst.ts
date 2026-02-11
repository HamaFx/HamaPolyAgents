import { BaseAgent } from "@/lib/ai/agents/base-agent";
import { buildAnalystPrompt } from "@/lib/ai/prompts/analyst-prompt";
import { SemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { analystOutputSchema, AnalystOutput } from "@/lib/ai/schemas/analyst-output";
import { ResearcherOutput } from "@/lib/ai/schemas/researcher-output";
import { callStructuredLLM } from "@/lib/ai/llm";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import { clamp, round } from "@/lib/utils";

export interface AnalystInput {
  anchor: SemanticAnchor;
  research: ResearcherOutput;
}

export class AnalystAgent extends BaseAgent<AnalystInput, AnalystOutput> {
  constructor() {
    super("analyst");
  }

  protected async run(input: AnalystInput) {
    const prompt = buildAnalystPrompt(input.anchor, input.research);
    const result = await callStructuredLLM({
      model: "gpt-4o",
      systemPrompt: SYSTEM_PROMPTS.analyst,
      userPrompt: prompt,
      schema: analystOutputSchema,
      fallback: () => {
        const edge = input.research.odds_assessment.edge;
        const confidence = clamp(0.5 + Math.abs(edge) * 1.8, 0.45, 0.92);
        const signal: AnalystOutput["synthesis"]["signal"] =
          edge > 0.1
            ? "strong_buy_yes"
            : edge > 0.03
              ? "buy_yes"
              : edge < -0.1
                ? "strong_buy_no"
                : edge < -0.03
                  ? "buy_no"
                  : "hold";

        return {
          bull_case: {
            argument: "The implied probability appears mispriced relative to expected drivers and market underreaction.",
            confidence: round(clamp(confidence + 0.05, 0, 1), 2),
            key_points: [
              "Edge indicated by researcher estimate",
              "Resolution criteria are concrete",
              "Liquidity is enough for controlled entry"
            ]
          },
          bear_case: {
            argument: "The edge may be noise; timing risk and sparse real-world catalysts can invalidate the thesis.",
            confidence: round(clamp(1 - confidence + 0.2, 0, 1), 2),
            key_points: [
              "Potential event uncertainty",
              "Market may already include known information",
              "Volatility can compress edge before resolution"
            ]
          },
          synthesis: {
            signal,
            confidence: round(confidence, 2),
            reasoning: `Signal generated from estimated edge ${edge.toFixed(3)} and adversarial balancing.`,
            suggested_size_pct: signal === "hold" ? 0 : round(clamp(Math.abs(edge) * 350, 5, 65), 2)
          }
        };
      }
    });

    return {
      output: result.output,
      reasoning: "Analyst produced bull/bear debate and synthesis trade signal.",
      tokensUsed: result.tokensUsed,
      latencyMs: 0,
      costEstimate: result.costEstimate
    };
  }
}

import { ResearcherOutput } from "@/lib/ai/schemas/researcher-output";
import { SemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";

export function buildAnalystPrompt(anchor: SemanticAnchor, research: ResearcherOutput): string {
  return JSON.stringify(
    {
      objective: "Generate adversarial bull/bear analysis and a synthesis trade signal.",
      team_strategy: anchor.teamStrategy,
      risk_profile: anchor.riskProfile,
      market: anchor.market,
      research
    },
    null,
    2
  );
}

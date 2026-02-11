import { fail, ok, parseJson } from "@/app/api/_shared";
import { AnalystAgent } from "@/lib/ai/agents/analyst";
import { ResearcherAgent } from "@/lib/ai/agents/researcher";
import { RiskManagerAgent } from "@/lib/ai/agents/risk-manager";
import { buildSemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { analystOutputSchema } from "@/lib/ai/schemas/analyst-output";
import { z } from "zod";

const schema = z.object({
  teamId: z.string().min(1),
  marketId: z.string().min(1),
  analysis: z.unknown().optional()
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, schema);
  if (!parsed.data) {
    return fail(parsed.error ?? "Invalid payload.");
  }

  try {
    const anchor = buildSemanticAnchor(parsed.data.teamId, parsed.data.marketId);

    let analysis;
    if (parsed.data.analysis) {
      analysis = analystOutputSchema.parse(parsed.data.analysis);
    } else {
      const researcher = new ResearcherAgent();
      const research = (await researcher.execute(anchor)).output;
      const analyst = new AnalystAgent();
      analysis = (await analyst.execute({ anchor, research })).output;
    }

    const agent = new RiskManagerAgent();
    const result = await agent.execute({
      teamId: parsed.data.teamId,
      anchor,
      analysis
    });

    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Risk manager failed.", 422);
  }
}

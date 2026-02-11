import { fail, ok, parseJson } from "@/app/api/_shared";
import { AnalystAgent } from "@/lib/ai/agents/analyst";
import { ExecutorAgent } from "@/lib/ai/agents/executor";
import { ResearcherAgent } from "@/lib/ai/agents/researcher";
import { RiskManagerAgent } from "@/lib/ai/agents/risk-manager";
import { buildSemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { analystOutputSchema } from "@/lib/ai/schemas/analyst-output";
import { riskManagerOutputSchema } from "@/lib/ai/schemas/risk-manager-output";
import { createPipelineRun } from "@/lib/store/memory";
import { z } from "zod";

const schema = z.object({
  teamId: z.string().min(1),
  marketId: z.string().min(1),
  analysis: z.unknown().optional(),
  risk: z.unknown().optional()
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

    let risk;
    if (parsed.data.risk) {
      risk = riskManagerOutputSchema.parse(parsed.data.risk);
    } else {
      const riskManager = new RiskManagerAgent();
      risk = (await riskManager.execute({
        teamId: parsed.data.teamId,
        anchor,
        analysis
      })).output;
    }

    const run = createPipelineRun(parsed.data.teamId, parsed.data.marketId);
    const executor = new ExecutorAgent();
    const result = await executor.execute({
      teamId: parsed.data.teamId,
      marketId: parsed.data.marketId,
      pipelineRunId: run.id,
      analysis,
      risk
    });

    return ok({
      pipelineRunId: run.id,
      ...result
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Executor failed.", 422);
  }
}

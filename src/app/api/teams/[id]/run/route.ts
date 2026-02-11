import { fail, ok, parseJson } from "@/app/api/_shared";
import { PipelineOrchestrator } from "@/lib/ai/pipeline/orchestrator";
import { getTeamById, pickBestMarketForTeam } from "@/lib/store/memory";
import { z } from "zod";

const runSchema = z.object({
  marketId: z.string().optional(),
  executeTrades: z.boolean().optional()
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const team = getTeamById(id);
  if (!team) {
    return fail("Team not found.", 404);
  }

  const parsed = await parseJson(request, runSchema);
  if (parsed.error) {
    return fail(parsed.error);
  }

  const marketId = parsed.data?.marketId ?? pickBestMarketForTeam(id)?.id;
  if (!marketId) {
    return fail("No open market available for this team.", 422);
  }

  const orchestrator = new PipelineOrchestrator();
  const result = await orchestrator.run({
    teamId: id,
    marketId,
    executeTrades: parsed.data?.executeTrades ?? true
  });

  if (!result) {
    return fail("Pipeline run could not be created.", 500);
  }

  return ok(result, 201);
}

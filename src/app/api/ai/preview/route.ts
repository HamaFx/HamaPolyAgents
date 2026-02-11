import { fail, ok, parseJson } from "@/app/api/_shared";
import { PipelineOrchestrator } from "@/lib/ai/pipeline/orchestrator";
import { pickBestMarketForTeam } from "@/lib/store/memory";
import { z } from "zod";

const previewSchema = z.object({
  teamId: z.string().min(1),
  marketId: z.string().optional()
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, previewSchema);
  if (!parsed.data) {
    return fail(parsed.error ?? "Invalid payload.");
  }

  const marketId = parsed.data.marketId ?? pickBestMarketForTeam(parsed.data.teamId)?.id;
  if (!marketId) {
    return fail("No market available for preview.", 422);
  }

  const orchestrator = new PipelineOrchestrator();
  const result = await orchestrator.run({
    teamId: parsed.data.teamId,
    marketId,
    executeTrades: false
  });

  if (!result) {
    return fail("Preview failed.", 500);
  }

  return ok(result, 201);
}

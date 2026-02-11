import { fail, ok, parseJson } from "@/app/api/_shared";
import { ResearcherAgent } from "@/lib/ai/agents/researcher";
import { buildSemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { z } from "zod";

const schema = z.object({
  teamId: z.string().min(1),
  marketId: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, schema);
  if (!parsed.data) {
    return fail(parsed.error ?? "Invalid payload.");
  }

  try {
    const anchor = buildSemanticAnchor(parsed.data.teamId, parsed.data.marketId);
    const agent = new ResearcherAgent();
    const result = await agent.execute(anchor);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Researcher failed.", 422);
  }
}

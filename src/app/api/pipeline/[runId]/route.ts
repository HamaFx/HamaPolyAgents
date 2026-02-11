import { fail, ok } from "@/app/api/_shared";
import { getPipelineRunDetail } from "@/lib/store/memory";

interface Params {
  params: Promise<{ runId: string }>;
}

export async function GET(_: Request, ctx: Params) {
  const { runId } = await ctx.params;
  const detail = getPipelineRunDetail(runId);
  if (!detail) {
    return fail("Pipeline run not found.", 404);
  }

  return ok(detail);
}

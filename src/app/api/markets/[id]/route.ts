import { fail, ok } from "@/app/api/_shared";
import { getMarketDetail } from "@/lib/store/memory";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, ctx: Params) {
  const { id } = await ctx.params;
  const detail = getMarketDetail(id);
  if (!detail) {
    return fail("Market not found.", 404);
  }

  return ok(detail);
}

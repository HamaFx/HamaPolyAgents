import { fail, ok, parseJson } from "@/app/api/_shared";
import { getDefaultUserId, listTrades, placeTrade } from "@/lib/store/memory";
import { z } from "zod";

const createTradeSchema = z.object({
  marketId: z.string().min(1),
  side: z.enum(["yes", "no"]),
  amount: z.number().positive(),
  teamId: z.string().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marketId = searchParams.get("market_id") ?? undefined;
  const teamId = searchParams.get("team_id") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 100);

  return ok(
    listTrades({
      marketId,
      teamId,
      limit: Number.isNaN(limit) ? 100 : Math.min(Math.max(limit, 1), 200)
    })
  );
}

export async function POST(request: Request) {
  const parsed = await parseJson(request, createTradeSchema);
  if (!parsed.data) {
    return fail(parsed.error ?? "Invalid trade payload.");
  }

  try {
    const result = placeTrade({
      ...parsed.data,
      userId: getDefaultUserId()
    });
    return ok(result, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Trade failed.", 422);
  }
}

import { fail, ok, parseJson } from "@/app/api/_shared";
import { deleteTeam, getTeamDetail, updateTeam } from "@/lib/store/memory";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  strategyPrompt: z.string().min(10).max(1000).optional(),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]).optional(),
  isActive: z.boolean().optional()
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, ctx: Params) {
  const { id } = await ctx.params;
  const team = getTeamDetail(id);
  if (!team) {
    return fail("Team not found.", 404);
  }
  return ok(team);
}

export async function PUT(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const parsed = await parseJson(request, updateSchema);
  if (!parsed.data) {
    return fail(parsed.error ?? "Invalid payload.");
  }

  const updated = updateTeam(id, parsed.data);
  if (!updated) {
    return fail("Team not found.", 404);
  }

  return ok(updated);
}

export async function DELETE(_: Request, ctx: Params) {
  const { id } = await ctx.params;
  const deleted = deleteTeam(id);
  if (!deleted) {
    return fail("Team not found.", 404);
  }
  return ok({ deleted: true });
}

import { fail, ok, parseJson } from "@/app/api/_shared";
import { createTeam, getDefaultUserId, listTeams } from "@/lib/store/memory";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(2).max(64),
  avatar: z.string().max(4).optional(),
  strategyPrompt: z.string().min(10).max(1000),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]),
  bankroll: z.number().min(100).max(1_000_000).optional()
});

export async function GET() {
  return ok(listTeams(getDefaultUserId()));
}

export async function POST(request: Request) {
  const parsed = await parseJson(request, createTeamSchema);
  if (!parsed.data) {
    return fail(parsed.error ?? "Invalid team payload.");
  }

  const team = createTeam(parsed.data, getDefaultUserId());
  return ok(team, 201);
}

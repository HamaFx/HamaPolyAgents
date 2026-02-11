import Link from "next/link";
import { Plus } from "lucide-react";
import { TeamCard } from "@/components/teams/team-card";
import { getTeamDetail, listTeams } from "@/lib/store/memory";

export default function TeamsPage() {
  const teams = listTeams()
    .map((team) => getTeamDetail(team.id))
    .filter((team): team is NonNullable<typeof team> => Boolean(team));

  return (
    <section className="space-y-4">
      <article className="surface flex items-center justify-between gap-3 p-5">
        <div>
          <h1 className="headline text-3xl">My Agent Teams</h1>
          <p className="mt-1 text-sm text-textSecondary">Deploy and tune specialized multi-agent committees.</p>
        </div>
        <Link href="/teams/new" className="inline-flex items-center gap-1 rounded-lg bg-accentBlue px-3 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> New Team
        </Link>
      </article>

      <div className="grid gap-3 xl:grid-cols-2">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </section>
  );
}

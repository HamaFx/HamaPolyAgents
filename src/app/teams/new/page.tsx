import { TeamWizard } from "@/components/teams/team-wizard";

export default function NewTeamPage() {
  return (
    <section className="space-y-4">
      <article className="surface p-5">
        <h1 className="headline text-3xl">Team Builder</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Configure strategy and risk defaults, then preview the multi-agent decision chain.
        </p>
      </article>
      <TeamWizard />
    </section>
  );
}

import Link from "next/link";
import { Bell, Flame, Plus, Radar } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 mb-4 border-b border-border/70 bg-bgPrimary/95 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="headline text-2xl">AgentBets</p>
          <p className="text-xs text-textSecondary">Multi-agent prediction market terminal</p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button className="inline-flex items-center gap-1 rounded-lg border border-border bg-bgCard px-3 py-2 text-xs text-textSecondary transition hover:text-textPrimary">
            <Bell className="h-4 w-4" /> Alerts
          </button>
          <Link
            href="/teams/new"
            className="inline-flex items-center gap-1 rounded-lg bg-accentBlue px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New Team
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg border border-accentGreen/35 bg-accentGreen/10 px-2 py-1 text-xs text-accentGreen">
            <Radar className="h-3.5 w-3.5" /> Live
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-accentYellow/35 bg-accentYellow/10 px-2 py-1 text-xs text-accentYellow">
            <Flame className="h-3.5 w-3.5" /> Demo
          </span>
        </div>
      </div>
    </header>
  );
}

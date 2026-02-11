import { formatDateTime } from "@/lib/format";
import { ActivityItem } from "@/types";

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="headline text-lg">Activity Feed</h2>
        <span className="text-xs text-textMuted">Realtime stream</span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-textSecondary">No activity yet.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-xl border border-border/80 bg-bgInput/35 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-textPrimary">{item.title}</p>
                <span className="text-[11px] text-textMuted">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-textSecondary">{item.description}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

import { Position } from "@/types";

export function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <section className="surface p-4">
      <h3 className="headline text-lg">Open Positions</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-textMuted">
            <tr>
              <th className="px-2 py-2">Market ID</th>
              <th className="px-2 py-2">Side</th>
              <th className="px-2 py-2">Shares</th>
              <th className="px-2 py-2">Avg Price</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-textSecondary" colSpan={5}>
                  No active positions.
                </td>
              </tr>
            ) : (
              positions.map((position) => (
                <tr key={position.id} className="border-t border-border/70 text-textSecondary">
                  <td className="px-2 py-2 text-textPrimary">{position.marketId.slice(0, 12)}</td>
                  <td className="px-2 py-2">{position.side.toUpperCase()}</td>
                  <td className="px-2 py-2">{position.shares.toFixed(2)}</td>
                  <td className="px-2 py-2">{position.avgPrice.toFixed(2)}c</td>
                  <td className="px-2 py-2">{position.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

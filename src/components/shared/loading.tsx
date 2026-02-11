export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="surface p-4">
      <div className="animate-pulse space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-4 rounded bg-bgInput" />
        ))}
      </div>
    </div>
  );
}

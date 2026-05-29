export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-surface/60 ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-surface/20">
          <Skeleton className="h-9 w-72" />
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className={`${j === cols - 1 ? "ml-auto w-20" : "flex-1"}`}>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[220px] w-full" />
      </div>
    </div>
  );
}

export interface SkeletonProps {
  className?: string;
}

/**
 * Generic animated pulse placeholder block.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/**
 * Multi-line text skeleton; shortens the last line for a natural look.
 */
export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => {
        const isLast = lines > 1 && index === lines - 1;
        return <Skeleton key={index} className={`h-3.5 ${isLast ? 'w-2/3' : 'w-full'}`} />;
      })}
    </div>
  );
}

export interface SkeletonCardProps {
  className?: string;
}

/**
 * Stat-card-sized skeleton placeholder for dashboard KPI cards.
 */
export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-20" />
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Table skeleton placeholder matching DataTable header and body rows.
 */
export function SkeletonTable({ rows = 5, columns = 4, className = '' }: SkeletonTableProps) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="min-w-[480px] divide-y divide-slate-200 dark:divide-slate-800">
        {/* Header row */}
        <div
          className="grid gap-4 bg-slate-50 px-4 py-3 dark:bg-slate-800/50"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className="h-3.5 w-3/4" />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="grid gap-4 px-4 py-3.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }, (_, col) => (
              <Skeleton key={col} className="h-3.5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


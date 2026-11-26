import type { ReactNode } from 'react';

export type StatCardTrendDirection = 'up' | 'down' | 'flat';
export type StatCardTrendTone = 'positive' | 'negative' | 'neutral';

export interface StatCardTrend {
  value: string;
  direction?: StatCardTrendDirection;
  tone?: StatCardTrendTone;
  description?: string;
}

export interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  description?: string;
  trend?: StatCardTrend;
  className?: string;
}

const TREND_CLASSES: Record<StatCardTrendTone, string> = {
  positive: 'text-[var(--status-success-text)]',
  negative: 'text-[var(--status-danger-text)]',
  neutral: 'text-[var(--text-secondary)]',
};

const TREND_ARROWS: Record<StatCardTrendDirection, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <article className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-[var(--text-secondary)]">{title}</h2>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</div>
        </div>
        {icon ? (
          <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
            {icon}
          </div>
        ) : null}
      </div>

      {trend || description ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {trend ? (
            <span className={`inline-flex items-center gap-1 font-semibold ${TREND_CLASSES[trend.tone ?? 'neutral']}`}>
              <span aria-hidden="true">{TREND_ARROWS[trend.direction ?? 'flat']}</span>
              {trend.value}
            </span>
          ) : null}
          {trend?.description || description ? (
            <span className="text-[var(--text-muted)]">{trend?.description ?? description}</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

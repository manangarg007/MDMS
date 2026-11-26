import { useId } from 'react';
import type { ReactNode } from 'react';

export interface ChartCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  actions,
  children,
  className = '',
}: ChartCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] ${className}`}
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

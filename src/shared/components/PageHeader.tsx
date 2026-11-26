import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  metadataBadge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  metadataBadge,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0 space-y-2">
        {breadcrumb ? (
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-secondary)]">
            {breadcrumb}
          </nav>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {title}
          </h1>
          {metadataBadge}
        </div>
        {subtitle ? (
          <p className="max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

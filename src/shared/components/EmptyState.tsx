import type { ReactNode } from 'react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <section className={`flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-10 text-center ${className}`}>
      {icon ? (
        <div aria-hidden="true" className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-[var(--text-secondary)]">{description}</p>
      ) : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
}

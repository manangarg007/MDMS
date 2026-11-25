import { Link } from 'react-router-dom';

export interface PlaceholderAction {
  label: string;
  to: string;
}

interface PlaceholderPageProps {
  title: string;
  description: string;
  roleLabel: string;
  routePath: string;
  ownerHint?: string;
  plannedItems?: string[];
  actions?: PlaceholderAction[];
}

export function PlaceholderPage({
  title,
  description,
  roleLabel,
  routePath,
  ownerHint,
  plannedItems,
  actions,
}: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {roleLabel}
            </span>
            <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {routePath}
            </code>
            {ownerHint ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Lead: {ownerHint}
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>

        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {plannedItems && plannedItems.length > 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 dark:border-slate-700 dark:bg-slate-900/60">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Phase 1 Screen Scope
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {plannedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

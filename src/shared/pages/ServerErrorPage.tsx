import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

/**
 * Router errorElement — receives thrown errors from route loaders and components.
 * Error detail is only shown in development (import.meta.env.DEV).
 */
export default function ServerErrorPage() {
  const error = useRouteError();

  let detail: string | undefined;
  if (isRouteErrorResponse(error)) {
    detail = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    detail = error.message;
  } else if (typeof error === 'string') {
    detail = error;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Illustration */}
      <svg
        className="mb-6 h-24 w-24 text-slate-300 dark:text-slate-700"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
      >
        <rect x="8" y="20" width="80" height="56" rx="8" stroke="currentColor" strokeWidth="3" />
        <circle cx="48" cy="48" r="16" stroke="currentColor" strokeWidth="3" />
        <path d="M48 38v12M48 54h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
        Application Error
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        An unexpected error occurred. Try refreshing the page or return to the login screen.
      </p>

      {/* Only reveal the raw error message during development */}
      {import.meta.env.DEV && detail ? (
        <pre className="mt-4 max-w-md overflow-x-auto rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-xs text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
          {detail}
        </pre>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Try again
        </button>
        <Link
          to="/login"
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

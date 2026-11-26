import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Illustration */}
      <svg
        className="mb-6 h-24 w-24 text-slate-300 dark:text-slate-700"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
      >
        <rect x="8" y="20" width="80" height="56" rx="8" stroke="currentColor" strokeWidth="3" />
        <path d="M28 44h8M44 44h24M28 56h16M52 56h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M64 36l8 8-8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M72 44H58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="72" cy="72" r="12" fill="currentColor" className="text-slate-200 dark:text-slate-800" />
        <path d="M68 76l8-8M68 68l8 8" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        404 Error
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The address you requested does not match any MDMS route. Double-check the URL or head back
        somewhere safe.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/login"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Go to Login
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

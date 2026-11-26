import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';

export default function AccessDeniedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Illustration — padlock */}
      <svg
        className="mb-6 h-24 w-24 text-slate-300 dark:text-slate-700"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
      >
        {/* Lock shackle */}
        <path
          d="M32 42V32a16 16 0 0132 0v10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lock body */}
        <rect x="22" y="42" width="52" height="38" rx="8" stroke="currentColor" strokeWidth="3" />
        {/* Keyhole */}
        <circle cx="48" cy="60" r="5" stroke="currentColor" strokeWidth="3" />
        <path d="M48 65v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
        403 Access Denied
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Permission required</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        You do not have permission to view this page. Contact your administrator or switch to an
        authorised role.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/login"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Back to Login
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

import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Illustration — wrench & gear */}
      <svg
        className="mb-6 h-24 w-24 text-slate-300 dark:text-slate-700"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="52" cy="44" r="20" stroke="currentColor" strokeWidth="3" />
        <circle cx="52" cy="44" r="8" stroke="currentColor" strokeWidth="3" />
        {/* Gear teeth */}
        <path d="M52 20v-5M52 73v-5M28 44h-5M81 44h-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M34.1 26.1l-3.5-3.5M73.4 65.4l-3.5-3.5M34.1 61.9l-3.5 3.5M73.4 22.6l-3.5 3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Wrench */}
        <path d="M22 70l20-20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 62a8 8 0 0110-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
        Scheduled Maintenance
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">We will be back shortly</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        MDMS is undergoing scheduled maintenance to improve your experience. Please check back
        in a little while.
      </p>

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
          Back to Login
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        Scheduled Maintenance
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">We will be back shortly</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Placeholder utility page at <code>/maintenance</code>.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Back to Login
      </Link>
    </div>
  );
}

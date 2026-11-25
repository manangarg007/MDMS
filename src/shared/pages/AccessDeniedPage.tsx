import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
        403 Access Denied
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Permission required</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Placeholder utility page at <code>/access-denied</code>.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Login
      </Link>
    </div>
  );
}

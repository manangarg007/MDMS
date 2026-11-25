import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        404 Error
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The address you requested does not match any MDMS route.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Go to Login
      </Link>
    </div>
  );
}

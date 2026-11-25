import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function ServerErrorPage() {
  const error = useRouteError();
  let message = 'An unexpected application error occurred.';

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <p className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
        500 Server / Route Error
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <Link
        to="/login"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Return to Login
      </Link>
    </div>
  );
}

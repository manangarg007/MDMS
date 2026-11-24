import { Link, useParams } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/components';

export default function ResetPasswordPage() {
  const { token } = useParams();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Route placeholder for <code className="text-xs">/reset-password/:token</code>.
          </p>
          <p className="text-xs text-slate-400">
            Token parameter: <code>{token ?? 'none'}</code>
          </p>
        </div>

        <Link
          to="/login"
          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

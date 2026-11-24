import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/components';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Route placeholder for <code className="text-xs">/forgot-password</code>. Email validation &amp; &ldquo;Check your email&rdquo; flow owned by Member A.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <Link
            to="/reset-password/demo-token"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Preview Reset Password
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

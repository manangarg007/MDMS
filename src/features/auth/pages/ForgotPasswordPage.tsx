import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField, Input } from '../../../shared/components';
import { isEmail, required } from '../../../shared/utils/validators';
import { AuthCardShell } from '../components';

const RESEND_COOLDOWN_SECONDS = 30;

function validateEmail(value: string): string | undefined {
  return required(value, 'Email') ?? isEmail(value);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Tick down the resend cooldown once per second while active
  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateEmail(email);
    setError(validationError);
    if (validationError) {
      return;
    }

    setSentToEmail(email.trim());
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = () => {
    if (secondsLeft > 0) {
      return;
    }
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  if (sentToEmail) {
    return (
      <AuthCardShell>
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M4 6h16v12H4z" strokeLinejoin="round" />
              <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We sent a password reset link to{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {sentToEmail}
            </span>
            .
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            disabled={secondsLeft > 0}
            onClick={handleResend}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {secondsLeft > 0 ? `Resend (${secondsLeft}s)` : 'Resend'}
          </button>

          <Link
            to="/reset-password/demo-token"
            className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Open reset link (demo)
          </Link>

          <Link
            to="/login"
            className="block text-center text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Back to Login
          </Link>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your account email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="forgot-email" label="Email address" required error={error}>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@mdms.in"
            value={email}
            error={error}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
              if (error) {
                setError(validateEmail(value));
              }
            }}
            onBlur={() => setError(validateEmail(email))}
          />
        </FormField>

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Send reset link
        </button>
      </form>

      <div className="text-center text-sm">
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Back to Login
        </Link>
      </div>
    </AuthCardShell>
  );
}

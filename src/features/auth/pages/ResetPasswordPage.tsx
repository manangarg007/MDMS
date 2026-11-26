import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField, PasswordField } from '../../../shared/components';
import { matches, passwordRules } from '../../../shared/utils/validators';
import { AuthCardShell } from '../components';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updated, setUpdated] = useState(false);

  const rules = passwordRules(password);
  const allRulesPassed = rules.every((rule) => rule.passed);
  const matchError =
    confirmPassword.length > 0
      ? matches(password, confirmPassword, 'Passwords do not match.')
      : undefined;
  const isMatchValid = confirmPassword.length > 0 && !matchError;
  const canSubmit = allRulesPassed && isMatchValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setUpdated(true);
  };

  if (updated) {
    return (
      <AuthCardShell>
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Password updated</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
        </div>

        <Link
          to="/login"
          className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Go to Login
        </Link>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose a strong new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="reset-password" label="New password" required>
          <PasswordField
            id="reset-password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <ul aria-label="Password requirements" className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
          {rules.map((rule) => (
            <li
              key={rule.label}
              className={`flex items-center gap-2 ${
                rule.passed
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span aria-hidden="true">{rule.passed ? '✓' : '○'}</span>
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>

        <FormField
          id="reset-confirm"
          label="Confirm password"
          required
          error={matchError}
        >
          <PasswordField
            id="reset-confirm"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            error={matchError}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
        >
          Update password
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

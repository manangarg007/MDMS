import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField, Input, PasswordField } from '../../../shared/components';
import { ROLE_META, setStoredRole } from '../../../shared/routes';
import type { UserRole } from '../../../shared/types';
import { isEmail, required } from '../../../shared/utils/validators';
import { AuthCardShell } from '../components';
import type { LoginCredentials } from '../types';

const ROLES: UserRole[] = ['end-user', 'zone', 'enterprise'];

interface LoginErrors {
  email?: string;
  password?: string;
}

function validateEmail(value: string): string | undefined {
  return required(value, 'Email') ?? isEmail(value);
}

function validatePassword(value: string): string | undefined {
  return required(value, 'Password');
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submittedValid, setSubmittedValid] = useState(false);

  const handleBlur = (field: keyof LoginErrors) => {
    const fieldError =
      field === 'email' ? validateEmail(form.email) : validatePassword(form.password);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: LoginErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);

    const hasError = Boolean(nextErrors.email || nextErrors.password);
    setSubmittedValid(!hasError);
  };

  return (
    <AuthCardShell>
      <div className="space-y-1 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
          M
        </span>
        <h1 className="pt-2 text-2xl font-bold tracking-tight">MDMS Sign In</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to access your metering workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="login-email" label="Email address" required error={errors.email}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@mdms.in"
            value={form.email}
            error={errors.email}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, email: value }));
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
              }
            }}
            onBlur={() => handleBlur('email')}
          />
        </FormField>

        <FormField id="login-password" label="Password" required error={errors.password}>
          <PasswordField
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            error={errors.password}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, password: value }));
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
              }
            }}
            onBlur={() => handleBlur('password')}
          />
        </FormField>

        <div className="flex items-center justify-between gap-2 text-sm">
          <label
            htmlFor="login-remember"
            className="inline-flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-300"
          >
            <input
              id="login-remember"
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, rememberMe: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Sign in
        </button>

        {submittedValid ? (
          <div
            role="status"
            className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs font-medium text-sky-900 dark:border-sky-800/70 dark:bg-sky-950/60 dark:text-sky-100"
          >
            Sign-in is not connected yet in Phase 1. Use one of the role links below.
          </div>
        ) : null}
      </form>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Temporary Phase 1 Role Switcher
        </p>
        <div className="grid gap-2">
          {ROLES.map((role) => {
            const meta = ROLE_META[role];
            return (
              <Link
                key={role}
                to={meta.defaultPath}
                onClick={() => setStoredRole(role)}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
              >
                <span>{meta.label}</span>
                <span className="text-xs text-slate-400">{meta.defaultPath}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </AuthCardShell>
  );
}

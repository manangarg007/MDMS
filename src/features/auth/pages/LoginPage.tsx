import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/components';
import { ROLE_META, setStoredRole } from '../../../shared/routes';
import type { UserRole } from '../../../shared/types';

const ROLES: UserRole[] = ['end-user', 'zone', 'enterprise'];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white">
            M
          </span>
          <h1 className="pt-2 text-2xl font-bold tracking-tight">MDMS Sign In</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Phase 1 foundation placeholder — full validation screen owned by Member A.
          </p>
        </div>

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
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  <span>{meta.label}</span>
                  <span className="text-xs text-slate-400">{meta.defaultPath}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <Link to="/forgot-password" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Forgot password?
          </Link>
          <div className="flex gap-3">
            <Link to="/maintenance" className="hover:underline">
              Maintenance
            </Link>
            <Link to="/access-denied" className="hover:underline">
              Access denied
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

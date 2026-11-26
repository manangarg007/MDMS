import type { ReactNode } from 'react';
import { ThemeToggle } from '../../../shared/components';

export interface AuthCardShellProps {
  children: ReactNode;
}

/**
 * Centered card layout shared by all authentication pages, with a top-right ThemeToggle.
 */
export function AuthCardShell({ children }: AuthCardShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}

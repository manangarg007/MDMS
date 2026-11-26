import { useState } from 'react';
import { Input, type InputProps } from './Input';

export type PasswordFieldProps = Omit<InputProps, 'type'>;

/**
 * Password input with an accessible show/hide toggle button.
 */
export function PasswordField({ className = '', ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...rest}
        type={visible ? 'text' : 'password'}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:text-indigo-600 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:text-indigo-400"
      >
        {visible ? (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-2.61 4.02M6.61 6.61A11.8 11.8 0 001 12.5C2.73 16.89 7 20 12 20a9.74 9.74 0 004.39-1.05"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

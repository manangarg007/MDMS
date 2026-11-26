import type { InputHTMLAttributes, Ref } from 'react';

export type InputType = 'text' | 'email' | 'tel' | 'number' | 'password';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  /** Pass a boolean or error message; any truthy value applies the error border and aria-invalid. */
  error?: boolean | string;
  ref?: Ref<HTMLInputElement>;
}

const BASE_CLASSES =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400';

const NORMAL_BORDER =
  'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

const ERROR_BORDER =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

/**
 * Styled text/email/tel/number input supporting light/dark mode and error states.
 */
export function Input({
  type = 'text',
  error,
  className = '',
  id,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...rest
}: InputProps) {
  const hasError = Boolean(error);
  const resolvedDescribedBy =
    ariaDescribedBy ?? (hasError && id ? `${id}-error` : undefined);

  return (
    <input
      ref={ref}
      id={id}
      type={type}
      aria-invalid={hasError || undefined}
      aria-describedby={resolvedDescribedBy}
      className={`${BASE_CLASSES} ${hasError ? ERROR_BORDER : NORMAL_BORDER} ${className}`}
      {...rest}
    />
  );
}

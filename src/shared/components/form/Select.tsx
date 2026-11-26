import type { Ref, SelectHTMLAttributes } from 'react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption<T>[];
  placeholder?: string;
  error?: boolean | string;
  ref?: Ref<HTMLSelectElement>;
}

const BASE_CLASSES =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-400';

const NORMAL_BORDER =
  'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

const ERROR_BORDER =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

/**
 * Typed dropdown select with optional placeholder and error styling.
 */
export function Select<T extends string = string>({
  options,
  placeholder,
  error,
  className = '',
  id,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...rest
}: SelectProps<T>) {
  const hasError = Boolean(error);
  const resolvedDescribedBy =
    ariaDescribedBy ?? (hasError && id ? `${id}-error` : undefined);

  return (
    <select
      ref={ref}
      id={id}
      aria-invalid={hasError || undefined}
      aria-describedby={resolvedDescribedBy}
      className={`${BASE_CLASSES} ${hasError ? ERROR_BORDER : NORMAL_BORDER} ${className}`}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

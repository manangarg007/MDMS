import type { ReactNode } from 'react';

export interface FormFieldProps {
  /** Must match the child control's `id` so the label and error/hint link accessibly. */
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a form control with a linked label, optional required marker, hint, and error message.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-red-500 dark:text-red-400" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

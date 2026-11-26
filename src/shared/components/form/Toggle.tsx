import { useId } from 'react';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Accessible switch control (`role="switch"`) with linked label text.
 */
export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: ToggleProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <label
          htmlFor={switchId}
          className={`block text-sm font-medium ${
            disabled
              ? 'cursor-not-allowed text-slate-400 dark:text-slate-500'
              : 'cursor-pointer text-slate-700 dark:text-slate-200'
          }`}
        >
          {label}
        </label>
        {description ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900 ${
          checked ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

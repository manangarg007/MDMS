export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

/**
 * Accessible inline loading spinner in three sizes (`sm`, `md`, `lg`).
 */
export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={`inline-flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-indigo-600 dark:text-indigo-400 ${SIZE_CLASSES[size]}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-85"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3.5a4.5 4.5 0 00-4.5 4.5H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}


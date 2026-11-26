import type { TimeRange } from '../types';

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

export interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  options?: TimeRangeOption[];
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_OPTIONS: TimeRangeOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export function TimeRangeToggle({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  ariaLabel = 'Select time range',
  className = '',
}: TimeRangeToggleProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1 ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${isSelected ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

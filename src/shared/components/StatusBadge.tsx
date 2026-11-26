export type StatusBadgeStatus =
  | 'active'
  | 'inactive'
  | 'deactivated'
  | 'disabled'
  | 'tampered'
  | 'maintenance'
  | 'paid'
  | 'unpaid'
  | 'pending'
  | 'overdue'
  | 'critical'
  | 'warning'
  | 'info'
  | 'acknowledged'
  | 'resolved'
  | 'success'
  | 'failed'
  | 'unknown';

export interface StatusBadgeProps {
  status: StatusBadgeStatus | (string & {});
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_TONES: Record<StatusBadgeStatus, StatusTone> = {
  active: 'success',
  inactive: 'neutral',
  deactivated: 'neutral',
  disabled: 'neutral',
  tampered: 'danger',
  maintenance: 'warning',
  paid: 'success',
  unpaid: 'warning',
  pending: 'warning',
  overdue: 'danger',
  critical: 'danger',
  warning: 'warning',
  info: 'info',
  acknowledged: 'info',
  resolved: 'success',
  success: 'success',
  failed: 'danger',
  unknown: 'neutral',
};

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-[var(--status-success-soft)] text-[var(--status-success-text)]',
  warning: 'bg-[var(--status-warning-soft)] text-[var(--status-warning-text)]',
  danger: 'bg-[var(--status-danger-soft)] text-[var(--status-danger-text)]',
  info: 'bg-[var(--status-info-soft)] text-[var(--status-info-text)]',
  neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
};

const SIZE_CLASSES: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

function formatStatus(status: string): string {
  return status
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());
}

export function StatusBadge({
  status,
  label = formatStatus(status),
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const tone = STATUS_TONES[status as StatusBadgeStatus] ?? 'neutral';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold leading-5 ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {label}
    </span>
  );
}

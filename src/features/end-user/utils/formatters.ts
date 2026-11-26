const inrFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

/**
 * Formats an INR amount like `Rs 1,230`.
 */
export function formatInr(amount: number): string {
  return `Rs ${inrFormatter.format(amount)}`;
}

/**
 * Formats a `YYYY-MM` billing month like `Nov 2026`.
 */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * Formats an ISO date or timestamp like `12 Dec 2026`.
 */
export function formatDate(isoValue: string): string {
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return isoValue;
  return dateFormatter.format(parsed);
}

/**
 * Formats an ISO timestamp like `25 Nov 2026, 23:59`.
 */
export function formatDateTime(isoValue: string): string {
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return isoValue;
  return dateTimeFormatter.format(parsed);
}

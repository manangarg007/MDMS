export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'end-ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 'start-ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'start-ellipsis', currentPage - 1, currentPage, currentPage + 1, 'end-ellipsis', totalPages];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = '',
}: PaginationProps) {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 1;
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / safePageSize));
  const page = Math.min(Math.max(1, Math.trunc(currentPage)), totalPages);
  const firstItem = totalItems === 0 ? 0 : (page - 1) * safePageSize + 1;
  const lastItem = Math.min(page * safePageSize, Math.max(0, totalItems));
  const pageItems = getPageItems(page, totalPages);
  const pageSizes = Array.from(new Set([safePageSize, ...pageSizeOptions]));

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col gap-3 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p aria-live="polite">Showing {firstItem}–{lastItem} of {Math.max(0, totalItems)}</p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <label className="mr-1 flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={safePageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1.5 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>

        <div role="group" aria-label={`Page ${page} of ${totalPages}`} className="flex items-center gap-1">
          {pageItems.map((item) => typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              className={`min-w-9 rounded-md px-2.5 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${item === page ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'}`}
            >
              {item}
            </button>
          ) : (
            <span key={item} aria-hidden="true" className="px-1 text-[var(--text-muted)]">…</span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
          className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  SortDirection,
  TableColumn,
  TableFilterOption,
} from '../types';

export interface DataTableFilter<T extends object> {
  key: string;
  accessorKey: keyof T;
  label: string;
  placeholder?: string;
  options: TableFilterOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export interface DataTableProps<T extends object> {
  data: T[];
  columns: TableColumn<T>[];
  /** An optional extra column, intended for cross-zone tables. */
  zoneColumn?: TableColumn<T>;
  filters?: DataTableFilter<T>[];
  /** An optional zone selector, kept separate from the other filters. */
  zoneFilter?: DataTableFilter<T>;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  initialPageSize?: number;
  getRowId?: (row: T, index: number) => string;
}

type SortValue = string | number | boolean | Date | null | undefined;

function readValue<T extends object>(row: T, column: TableColumn<T>): unknown {
  if (column.accessorKey !== undefined) {
    return row[column.accessorKey];
  }

  if (Object.hasOwn(row, column.key)) {
    return row[column.key as keyof T];
  }

  return undefined;
}

function toSearchText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function compareValues(left: SortValue, right: SortValue): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function displayValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '—';
}

export function DataTable<T extends object>({
  data,
  columns,
  zoneColumn,
  filters = [],
  zoneFilter,
  searchPlaceholder = 'Search rows...',
  searchKeys,
  initialPageSize = 5,
  getRowId,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const visibleColumns = useMemo(() => {
    const standardColumns = columns.filter((column) => !column.hidden);
    if (!zoneColumn || zoneColumn.hidden) return standardColumns;
    if (standardColumns.some((column) => column.key === zoneColumn.key)) {
      return standardColumns;
    }
    return [...standardColumns, zoneColumn];
  }, [columns, zoneColumn]);

  const activeFilters = useMemo(
    () => zoneFilter ? [...filters, zoneFilter] : filters,
    [filters, zoneFilter],
  );
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return data.filter((row) => {
      const matchesSearch = !normalizedSearch || (searchKeys
        ? searchKeys.some((key) => toSearchText(row[key]).toLocaleLowerCase().includes(normalizedSearch))
        : visibleColumns.some((column) => toSearchText(readValue(row, column)).toLocaleLowerCase().includes(normalizedSearch)));
      if (!matchesSearch) return false;

      return activeFilters.every((filter) => {
        const selectedValue = filter.value ?? filterValues[filter.key] ?? '';
        if (!selectedValue) return true;
        return toSearchText(row[filter.accessorKey]) === selectedValue;
      });
    });
  }, [activeFilters, data, filterValues, search, searchKeys, visibleColumns]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    const sortColumn = visibleColumns.find((column) => column.key === sort.key);
    if (!sortColumn || sortColumn.sortable === false) return filteredRows;

    return [...filteredRows].sort((left, right) => {
      const leftValue = sortColumn.sortValue
        ? sortColumn.sortValue(left)
        : readValue(left, sortColumn) as SortValue;
      const rightValue = sortColumn.sortValue
        ? sortColumn.sortValue(right)
        : readValue(right, sortColumn) as SortValue;
      const order = compareValues(leftValue, rightValue);
      return sort.direction === 'asc' ? order : -order;
    });
  }, [filteredRows, sort, visibleColumns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstItem = sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, sortedRows.length);

  function updateFilter(filter: DataTableFilter<T>, value: string) {
    setFilterValues((current) => ({ ...current, [filter.key]: value }));
    filter.onChange?.(value);
    setPage(1);
  }

  function updateSort(column: TableColumn<T>) {
    if (column.sortable === false) return;
    setSort((current) => ({
      key: column.key,
      direction: current?.key === column.key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
        <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 md:max-w-xs">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {activeFilters.map((filter) => (
              <label
                key={filter.key}
                className="flex min-w-40 flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {filter.label}
                <select
                  value={filter.value ?? filterValues[filter.key] ?? ''}
                  onChange={(event) => updateFilter(filter, event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">{filter.placeholder ?? `All ${filter.label.toLowerCase()}`}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={`px-4 py-3 font-semibold ${column.widthClassName ?? ''} ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {column.sortable === false ? column.header : (
                    <button
                      type="button"
                      onClick={() => updateSort(column)}
                      className="inline-flex items-center gap-1.5 text-inherit hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:text-white"
                    >
                      {column.header}
                      <span aria-hidden="true">
                        {sort?.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pageRows.map((row, index) => (
              <tr
                key={getRowId ? getRowId(row, (currentPage - 1) * pageSize + index) : (index + (currentPage - 1) * pageSize)}
                className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {column.render ? column.render(row) : displayValue(readValue(row, column))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite">Showing {firstItem}–{lastItem} of {sortedRows.length}</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {[5, 10, 25].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 font-medium text-slate-700 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 font-medium text-slate-700 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

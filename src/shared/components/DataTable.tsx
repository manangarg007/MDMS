import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { JsonServerTableQuery } from '../../services/tableQuery';
import { fetchJsonServerPage } from '../../services/tableQuery';
import type { JsonServerPage } from '../../services/tableQuery';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import type {
  SortDirection,
  TableColumn,
  TableFilterOption,
  TableRowAction,
  TableSelectionConfig,
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
  data?: T[];
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
  rowActions?: TableRowAction<T>[];
  selection?: TableSelectionConfig;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Enables controlled server-side query state and JSON Server fetching. */
  server?: DataTableServerConfig<T>;
}

export interface DataTableServerConfig<T extends object> {
  endpoint?: string;
  loadPage?: (
    query: JsonServerTableQuery,
    signal: AbortSignal,
  ) => Promise<JsonServerPage<T>>;
  query: JsonServerTableQuery;
  onQueryChange: (query: JsonServerTableQuery) => void;
  searchFields?: string[];
  refreshKey?: string | number;
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
  data: clientData = [],
  columns,
  zoneColumn,
  filters = [],
  zoneFilter,
  searchPlaceholder = 'Search rows...',
  searchKeys,
  initialPageSize = 5,
  getRowId,
  rowActions = [],
  selection,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try changing your search or filters.',
  server,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [reloadToken, setReloadToken] = useState(0);
  const [serverResult, setServerResult] = useState<{
    requestKey: string;
    data: T[];
    total: number;
    error: string | null;
  }>({ requestKey: '', data: [], total: 0, error: null });

  const serverEndpoint = server?.endpoint;
  const serverLoadPage = server?.loadPage;
  const serverQuery = server?.query;

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
  const serverSearchFields = useMemo(
    () => server?.searchFields ?? (searchKeys
      ? searchKeys.map(String)
      : visibleColumns.map((column) => String(column.accessorKey ?? column.key))),
    [searchKeys, server?.searchFields, visibleColumns],
  );
  const serverRequestKey = `${serverEndpoint ?? 'service'}:${JSON.stringify(serverQuery ?? {})}:${JSON.stringify(serverSearchFields)}:${server?.refreshKey ?? ''}:${reloadToken}`;
  const serverResultIsCurrent = serverResult.requestKey === serverRequestKey;
  const serverData = server && serverResultIsCurrent ? serverResult.data : [];
  const serverTotal = server && serverResultIsCurrent ? serverResult.total : 0;
  const serverLoading = Boolean((serverEndpoint || serverLoadPage) && serverQuery && !serverResultIsCurrent);
  const serverError = serverResultIsCurrent ? serverResult.error : null;

  useEffect(() => {
    if (!serverQuery || (!serverEndpoint && !serverLoadPage)) return undefined;

    const controller = new AbortController();
    const requestKey = serverRequestKey;
    const request = serverLoadPage
      ? serverLoadPage(serverQuery, controller.signal)
      : serverEndpoint
        ? fetchJsonServerPage<T>(serverEndpoint, serverQuery, controller.signal, {
            searchFields: serverSearchFields,
          })
        : Promise.reject(new Error('A server endpoint or page loader is required.'));

    void request
      .then((result) => {
        setServerResult({ requestKey, data: result.data, total: result.total, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setServerResult({
          requestKey,
          data: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Unable to load table data.',
        });
      });

    return () => controller.abort();
  }, [serverEndpoint, serverLoadPage, serverQuery, serverRequestKey, serverSearchFields]);

  const sourceData = server ? serverData : clientData;
  const filteredRows = useMemo(() => {
    if (server) return sourceData;
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return sourceData.filter((row) => {
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
  }, [activeFilters, filterValues, search, searchKeys, server, sourceData, visibleColumns]);

  const activeSort = server
    ? server.query.sortBy
      ? { key: server.query.sortBy, direction: server.query.sortOrder ?? 'asc' }
      : null
    : sort;
  const sortedRows = useMemo(() => {
    if (server || !sort) return filteredRows;
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
  }, [filteredRows, server, sort, visibleColumns]);

  const totalItems = server ? serverTotal : sortedRows.length;
  const activePageSize = server
    ? (Number.isFinite(server.query.limit) && server.query.limit > 0 ? Math.trunc(server.query.limit) : 1)
    : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));
  const currentPage = server
    ? Math.min(Math.max(1, Math.trunc(server.query.page)), totalPages)
    : Math.min(page, totalPages);
  const pageRows = server
    ? serverData
    : sortedRows.slice((currentPage - 1) * activePageSize, currentPage * activePageSize);
  const isLoading = loading || serverLoading;
  const hasSelection = selection !== undefined;
  const hasActions = rowActions.length > 0;

  function getFilterValue(filter: DataTableFilter<T>): string {
    if (server) {
      const value = server.query.filters?.[String(filter.accessorKey)];
      return value === undefined ? '' : String(value);
    }
    return filter.value ?? filterValues[filter.key] ?? '';
  }

  function getRowKey(row: T, index: number): string {
    return getRowId ? getRowId(row, index) : String(index);
  }

  function toggleRow(row: T, index: number) {
    if (!selection) return;
    const rowId = getRowKey(row, index);
    const nextIds = selection.selectedIds.includes(rowId)
      ? selection.selectedIds.filter((selectedId) => selectedId !== rowId)
      : [...selection.selectedIds, rowId];
    selection.onChange(nextIds);
  }

  function togglePageRows() {
    if (!selection) return;
    const pageIds = pageRows.map((row, index) => getRowKey(row, (currentPage - 1) * pageSize + index));
    const allPageRowsSelected = pageIds.every((rowId) => selection.selectedIds.includes(rowId));
    const nextIds = allPageRowsSelected
      ? selection.selectedIds.filter((selectedId) => !pageIds.includes(selectedId))
      : [...new Set([...selection.selectedIds, ...pageIds])];
    selection.onChange(nextIds);
  }

  function updateFilter(filter: DataTableFilter<T>, value: string) {
    if (server) {
      const field = String(filter.accessorKey);
      server.onQueryChange({
        ...server.query,
        page: 1,
        filters: { ...server.query.filters, [field]: value || undefined },
      });
      filter.onChange?.(value);
      return;
    }
    setFilterValues((current) => ({ ...current, [filter.key]: value }));
    filter.onChange?.(value);
    setPage(1);
  }

  function updateSort(column: TableColumn<T>) {
    if (column.sortable === false) return;
    if (server) {
      const key = String(column.accessorKey ?? column.key);
      const currentDirection = server.query.sortBy === key ? server.query.sortOrder ?? 'asc' : null;
      server.onQueryChange({
        ...server.query,
        page: 1,
        sortBy: key,
        sortOrder: currentDirection === 'asc' ? 'desc' : 'asc',
      });
      return;
    }
    setSort((current) => ({
      key: column.key,
      direction: current?.key === column.key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  }

  function updatePage(nextPage: number) {
    if (server) {
      server.onQueryChange({ ...server.query, page: nextPage });
      return;
    }
    setPage(nextPage);
  }

  function updatePageSize(nextPageSize: number) {
    if (server) {
      server.onQueryChange({ ...server.query, page: 1, limit: nextPageSize });
      return;
    }
    setPageSize(nextPageSize);
    setPage(1);
  }

  function resetSearchAndFilters() {
    if (server) {
      server.onQueryChange({ ...server.query, page: 1, search: '', filters: {} });
      return;
    }
    setSearch('');
    setFilterValues({});
    activeFilters.forEach((filter) => filter.onChange?.(''));
    setPage(1);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
        <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 md:max-w-xs">
          Search
          <input
            type="search"
          value={server ? server.query.search ?? '' : search}
            onChange={(event) => {
            if (server) {
              server.onQueryChange({ ...server.query, page: 1, search: event.target.value });
            } else {
              setSearch(event.target.value);
              setPage(1);
            }
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
                  value={getFilterValue(filter)}
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

      {isLoading ? (
        <div role="status" className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          Loading rows...
        </div>
      ) : pageRows.length === 0 ? (
        <EmptyState
          title={serverError ? 'Unable to load records' : emptyTitle}
          description={serverError ?? (totalItems === 0 ? emptyDescription : 'There are no rows on this page.')}
          action={serverError
            ? { label: 'Try again', onClick: () => setReloadToken((current) => current + 1) }
            : { label: 'Reset search and filters', onClick: resetSearchAndFilters }}
          className="rounded-none border-x-0 border-t-0"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                {hasSelection ? (
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all rows on this page"
                      checked={pageRows.length > 0 && pageRows.every((row, index) => selection.selectedIds.includes(getRowKey(row, (currentPage - 1) * activePageSize + index)))}
                      onChange={togglePageRows}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                ) : null}
                {visibleColumns.map((column) => {
                  const columnSortKey = server ? String(column.accessorKey ?? column.key) : column.key;
                  const isSorted = activeSort?.key === columnSortKey;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={isSorted ? (activeSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
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
                            {isSorted ? (activeSort.direction === 'asc' ? '↑' : '↓') : '↕'}
                          </span>
                        </button>
                      )}
                    </th>
                  );
                })}
                {hasActions ? <th scope="col" className="px-4 py-3 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageRows.map((row, index) => (
                <tr
                  key={getRowKey(row, (currentPage - 1) * activePageSize + index)}
                  className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                >
                  {hasSelection ? (
                    <td className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${getRowKey(row, (currentPage - 1) * activePageSize + index)}`}
                        checked={selection.selectedIds.includes(getRowKey(row, (currentPage - 1) * activePageSize + index))}
                        onChange={() => toggleRow(row, (currentPage - 1) * activePageSize + index)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  ) : null}
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {column.render ? column.render(row) : displayValue(readValue(row, column))}
                    </td>
                  ))}
                  {hasActions ? (
                    <td className="px-4 py-3 text-right">
                      <details className="group relative inline-block text-left">
                        <summary className="cursor-pointer list-none rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                          More <span aria-hidden="true">▾</span>
                        </summary>
                        <div className="absolute right-0 z-10 mt-1 min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          {rowActions
                            .filter((action) => !(typeof action.hidden === 'function' ? action.hidden(row) : action.hidden))
                            .map((action) => {
                              const disabled = typeof action.disabled === 'function'
                                ? action.disabled(row)
                                : action.disabled ?? false;
                              return (
                                <button
                                  key={action.id}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => action.onClick(row)}
                                  className={`block w-full rounded-md px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${action.variant === 'danger' ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                                >
                                  {action.label}
                                </button>
                              );
                            })}
                        </div>
                      </details>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <Pagination
          currentPage={currentPage}
          totalItems={isLoading ? 0 : totalItems}
          pageSize={activePageSize}
          onPageChange={updatePage}
          onPageSizeChange={updatePageSize}
          pageSizeOptions={server ? [10, 25, 50] : [5, 10, 25]}
        />
      </div>
    </section>
  );
}

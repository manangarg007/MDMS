import http from './http';
import type { FilterParams, FilterValue, SortOrder } from '../shared/types';

/** Query state accepted by the shared, server-paginated table. */
export interface JsonServerTableQuery<TFilters extends FilterParams = FilterParams> {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  filters?: TFilters;
}

export type JsonServerQueryValue = string | number | boolean;

/** Flat Axios params understood by JSON Server. */
export interface JsonServerQueryParams {
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: SortOrder;
  q?: string;
  [field: string]: JsonServerQueryValue | undefined;
}

export interface JsonServerPage<T> {
  data: T[];
  total: number;
}

const RESERVED_QUERY_FIELDS = new Set(['_page', '_limit', '_sort', '_order', 'q']);

function normalizePositiveInteger(value: number): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  return Math.max(1, Math.trunc(value));
}

function normalizeFilterValue(value: FilterValue): JsonServerQueryValue | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
  return value;
}

function parseTotalCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return undefined;
  const total = Number(normalized);
  return Number.isSafeInteger(total) ? total : undefined;
}

/** Convert controlled table state into JSON Server's flat query parameter format. */
export function buildJsonServerQueryParams<TFilters extends FilterParams = FilterParams>(
  query: JsonServerTableQuery<TFilters>,
): JsonServerQueryParams {
  const params: JsonServerQueryParams = {};
  const page = normalizePositiveInteger(query.page);
  const limit = normalizePositiveInteger(query.limit);

  if (page !== undefined) params._page = page;
  if (limit !== undefined) params._limit = limit;

  const sortBy = query.sortBy?.trim();
  if (sortBy) {
    params._sort = sortBy;
    if (query.sortOrder) params._order = query.sortOrder;
  }

  const search = query.search?.trim();
  if (search) params.q = search;

  if (query.filters) {
    for (const field of Object.keys(query.filters)) {
      if (RESERVED_QUERY_FIELDS.has(field)) continue;
      const value = normalizeFilterValue(query.filters[field]);
      if (value !== undefined) params[field] = value;
    }
  }

  return params;
}

/** Fetch one JSON Server page and its total count from the response header. */
export async function fetchJsonServerPage<T>(
  endpoint: string,
  query: JsonServerTableQuery,
  signal?: AbortSignal,
): Promise<JsonServerPage<T>> {
  const response = await http.get<T[]>(endpoint, {
    params: buildJsonServerQueryParams(query),
    signal,
  });
  const data = response.data;
  const total = parseTotalCount(response.headers['x-total-count']) ?? data.length;

  return { data, total };
}

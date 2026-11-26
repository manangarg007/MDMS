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

export interface JsonServerFetchOptions {
  /** Fields searched with JSON Server v1's case-insensitive `contains` operator. */
  searchFields?: string[];
}

interface JsonServerPaginatedResponse<T> {
  data: T[];
  items?: number;
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
  options: JsonServerFetchOptions = {},
): Promise<JsonServerPage<T>> {
  const queryParams = buildJsonServerQueryParams(query);
  const requestParams: JsonServerQueryParams = { ...queryParams };
  const perPage = requestParams._limit;
  const sortBy = requestParams._sort;
  const sortOrder = requestParams._order;
  const search = requestParams.q;
  delete requestParams._limit;
  delete requestParams._order;
  delete requestParams.q;

  if (perPage !== undefined) requestParams._per_page = perPage;
  if (sortBy) requestParams._sort = sortOrder === 'desc' ? `-${sortBy}` : sortBy;

  const searchFields = options.searchFields?.filter((field) => field.trim().length > 0) ?? [];
  if (search && searchFields.length > 0) {
    const where: Record<string, unknown> = {};
    for (const field of Object.keys(query.filters ?? {})) {
      const value = query.filters?.[field];
      const normalizedValue = normalizeFilterValue(value);
      if (normalizedValue !== undefined && !RESERVED_QUERY_FIELDS.has(field)) {
        where[field] = { eq: normalizedValue };
      }
      delete requestParams[field];
    }
    where.or = searchFields.map((field) => ({ [field]: { contains: search } }));
    requestParams._where = JSON.stringify(where);
  } else if (search) {
    // Preserve compatibility with JSON Server versions that support q directly.
    requestParams.q = search;
  }

  const response = await http.get<T[] | JsonServerPaginatedResponse<T>>(endpoint, {
    // json-server v1 beta uses `_per_page`, signed `_sort`, and a metadata envelope.
    // The exported query builder retains the stable `_limit` / `_order` adapter format.
    params: requestParams,
    signal,
  });
  const payload = response.data;
  const isPaginatedResponse = !Array.isArray(payload);
  const data = isPaginatedResponse ? payload.data : payload;
  const total = parseTotalCount(response.headers['x-total-count'])
    ?? (isPaginatedResponse ? parseTotalCount(payload.items) : undefined)
    ?? data.length;

  return { data, total };
}

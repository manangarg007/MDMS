import type { ListQueryParams, PaginatedResult } from '../shared/types';
import { http } from './http';

/**
 * Response envelope returned by JSON Server v1.0.0-beta.15 when `_page` is provided.
 */
export interface JsonServerPaginatedResponse<T> {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: T[];
}

export interface ListQueryOptions extends ListQueryParams {
  /** Field name to search against using JSON Server's `:contains` operator. */
  searchField?: string;
  /** Additional exact-match or operator filters (e.g. `{ zoneId: 'Z01', status: 'active' }`). */
  filters?: Record<string, string | number | boolean | undefined>;
}

/**
 * Builds JSON Server v1 query parameters from our shared `ListQueryParams`.
 */
export function buildJsonServerParams(
  options: ListQueryOptions = {},
): Record<string, string | number | boolean> {
  const { page = 1, limit = 10, sortBy, order = 'asc', search, searchField, filters } = options;

  const params: Record<string, string | number | boolean> = {
    _page: page,
    _per_page: limit,
  };

  if (sortBy) {
    // JSON Server v1 uses a leading "-" prefix for descending sort
    params._sort = order === 'desc' ? `-${sortBy}` : sortBy;
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch && searchField) {
    params[`${searchField}:contains`] = trimmedSearch;
  }

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    }
  }

  return params;
}

/**
 * Maps JSON Server v1's `{ data, items, ... }` envelope to `PaginatedResult<T>`.
 */
export function mapPaginatedResponse<T>(
  response: JsonServerPaginatedResponse<T>,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items: response.data,
    total: response.items,
    page,
    limit,
  };
}

/**
 * Executes a paginated GET request against JSON Server and returns `PaginatedResult<T>`.
 */
export async function fetchPaginatedList<T>(
  endpoint: string,
  options: ListQueryOptions = {},
): Promise<PaginatedResult<T>> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const params = buildJsonServerParams({ ...options, page, limit });

  const { data } = await http.get<JsonServerPaginatedResponse<T>>(endpoint, { params });
  return mapPaginatedResponse(data, page, limit);
}

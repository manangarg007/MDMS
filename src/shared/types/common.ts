export type SortOrder = 'asc' | 'desc';

export type SortDirection = SortOrder;

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export type ThemeMode = 'light' | 'dark';

export interface PaginationParams {
  page: number;
  limit: number;
}

export type FilterValue = string | number | boolean | undefined;

export type FilterParams = Record<string, FilterValue>;

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: SortOrder;
  search?: string;
}

export interface TableQueryParams<TFilters extends FilterParams = FilterParams>
  extends ListQueryParams {
  filters?: TFilters;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ChartSeriesPoint {
  label: string;
  value: number;
  previousValue?: number;
}

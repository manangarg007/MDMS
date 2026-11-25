export type SortOrder = 'asc' | 'desc';

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export type ThemeMode = 'light' | 'dark';

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: SortOrder;
  search?: string;
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

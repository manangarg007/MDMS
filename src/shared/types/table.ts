import type { ReactNode } from 'react';
import type { SortDirection } from './common';

export type TableColumnAlign = 'left' | 'center' | 'right';

export type SortablePrimitive = string | number | boolean | Date | null | undefined;

export interface TableSortState<TKey extends string = string> {
  key: TKey;
  direction: SortDirection;
}

export interface TableColumn<T, TKey extends string = string> {
  key: TKey;
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => SortablePrimitive;
  align?: TableColumnAlign;
  widthClassName?: string;
  hidden?: boolean;
}

export interface TableFilterOption {
  label: string;
  value: string;
}

export interface TableFilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: TableFilterOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export interface TablePaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

export type TableRowActionVariant = 'default' | 'danger';

export interface TableRowAction<T> {
  id: string;
  label: string;
  variant?: TableRowActionVariant;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
  onClick: (row: T) => void;
}

export interface TableSelectionConfig {
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId?: (row: T) => string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: TableFilterConfig[];
  sort?: TableSortState | null;
  onSortChange?: (sort: TableSortState | null) => void;
  pagination?: TablePaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  rowActions?: TableRowAction<T>[];
  selection?: TableSelectionConfig;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

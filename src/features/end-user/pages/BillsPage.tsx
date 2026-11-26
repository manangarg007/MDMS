import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  Select,
  SkeletonTable,
  StatusBadge,
  type SelectOption,
} from '../../../shared/components';
import type { Bill, BillStatus, TableColumn, TableRowAction } from '../../../shared/types';
import { useBills } from '../hooks/useBills';
import { formatDate, formatInr, formatMonth } from '../utils/formatters';

type StatusFilterValue = '' | BillStatus;

const PAGE_SIZE = 10;

const STATUS_OPTIONS: SelectOption<StatusFilterValue>[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export default function BillsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('');
  const [page, setPage] = useState(1);

  const { bills, total, loading, error, reload } = useBills({
    status: statusFilter || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const handleStatusChange = (nextStatus: StatusFilterValue) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const columns = useMemo<TableColumn<Bill>[]>(
    () => [
      {
        key: 'month',
        header: 'Month',
        accessorKey: 'month',
        render: (row) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatMonth(row.month)}
          </span>
        ),
      },
      {
        key: 'units',
        header: 'Units (kWh)',
        accessorKey: 'units',
        align: 'right',
        render: (row) => row.units.toFixed(1),
      },
      {
        key: 'amount',
        header: 'Amount (INR)',
        accessorKey: 'amount',
        align: 'right',
        render: (row) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatInr(row.amount)}
          </span>
        ),
      },
      {
        key: 'dueDate',
        header: 'Due date',
        accessorKey: 'dueDate',
        render: (row) => formatDate(row.dueDate),
      },
      {
        key: 'status',
        header: 'Status',
        accessorKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [],
  );

  const rowActions = useMemo<TableRowAction<Bill>[]>(
    () => [
      {
        id: 'view',
        label: 'View',
        onClick: (row) => navigate(`/user/bills/${row.id}`),
      },
      {
        id: 'pay',
        label: 'Pay',
        hidden: (row) => row.status === 'paid',
        onClick: (row) => navigate(`/user/bills/${row.id}`),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bills"
        subtitle="All bills are generated on the 1st of every month."
        actions={
          <div className="flex items-center gap-2">
            <label
              htmlFor="bills-status-filter"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Status
            </label>
            <Select<StatusFilterValue>
              id="bills-status-filter"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as StatusFilterValue)}
              options={STATUS_OPTIONS}
              className="w-36"
            />
          </div>
        }
      />

      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          title="No bills found"
          description={
            statusFilter
              ? `No ${statusFilter} bills were found for your account.`
              : 'There are no billing records available yet.'
          }
          action={
            statusFilter
              ? { label: 'Show all bills', onClick: () => handleStatusChange('') }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            data={bills}
            columns={columns}
            rowActions={rowActions}
            initialPageSize={PAGE_SIZE}
            getRowId={(row) => row.id}
            searchKeys={['month', 'status']}
            searchPlaceholder="Search bills..."
          />

          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DataTable,
  EmptyState,
  PageHeader,
  SkeletonCard,
  SkeletonTable,
  StatusBadge,
} from '../../../shared/components';
import type { BillDay, TableColumn } from '../../../shared/types';
import { useBillDetails } from '../hooks/useBillDetails';
import { formatDate, formatInr, formatMonth } from '../utils/formatters';

export default function BillDetailsPage() {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const { bill, billDays, loading, notFound, error, reload } = useBillDetails(billId);

  const columns = useMemo<TableColumn<BillDay>[]>(
    () => [
      {
        key: 'date',
        header: 'Date',
        accessorKey: 'date',
        render: (row) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatDate(row.date)}
          </span>
        ),
      },
      {
        key: 'reading',
        header: 'Reading',
        accessorKey: 'reading',
        align: 'right',
        render: (row) => row.reading.toFixed(2),
      },
      {
        key: 'consumption',
        header: 'Consumption (kWh)',
        accessorKey: 'consumption',
        align: 'right',
        render: (row) => row.consumption.toFixed(2),
      },
      {
        key: 'cost',
        header: 'Cost (INR)',
        accessorKey: 'cost',
        align: 'right',
        render: (row) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatInr(row.cost)}
          </span>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={8} columns={4} />
      </div>
    );
  }

  if (notFound || (!error && !bill)) {
    return (
      <div className="space-y-4">
        <Link
          to="/user/bills"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to My bills
        </Link>
        <EmptyState
          title="Bill not found"
          description={`No bill matching "${billId ?? ''}" could be found.`}
          action={{ label: 'Back to My bills', onClick: () => navigate('/user/bills') }}
        />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="space-y-4">
        <Link
          to="/user/bills"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to My bills
        </Link>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link
          to="/user/bills"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to My bills
        </Link>
      </div>

      <PageHeader
        title={`Bill — ${formatMonth(bill.month)}`}
        subtitle={`Bill ID ${bill.id} • Meter ${bill.meterId}`}
        metadataBadge={<StatusBadge status={bill.status} size="md" />}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              disabled
              title="Coming in a later phase"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Print
            </button>
            <button
              type="button"
              disabled
              title="Coming in a later phase"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pay now
            </button>
          </div>
        }
      />

      {/* Top bill summary */}
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Billing Month
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatMonth(bill.month)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Amount
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatInr(bill.amount)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {bill.units.toFixed(1)} kWh billed
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Due Date
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatDate(bill.dueDate)}
          </p>
          {bill.paidDate ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Paid on {formatDate(bill.paidDate)}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Status
          </p>
          <div className="mt-1.5">
            <StatusBadge status={bill.status} size="md" />
          </div>
        </div>
      </section>

      {/* Daily breakdown */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Daily breakdown
        </h2>

        {billDays.length === 0 ? (
          <EmptyState
            title="Daily breakdown not available"
            description="Day-by-day meter readings are only available for the demo customer's bills."
          />
        ) : (
          <DataTable
            data={billDays}
            columns={columns}
            initialPageSize={31}
            getRowId={(row) => row.id}
            searchKeys={['date']}
            searchPlaceholder="Filter by date..."
          />
        )}
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartCard,
  ChartWrapper,
  PageHeader,
  StatCard,
  TimeRangeToggle,
} from '../../../shared/components';
import { Skeleton } from '../../../shared/components/loading';
import { REFERENCE_DATE } from '../../../shared/config/demo';
import type { TimeRange } from '../../../shared/types';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardSummary } from '../types/dashboard';

const REFERENCE_DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
});

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : REFERENCE_DATE_FORMATTER.format(date);
}

function formatTimestamp(value?: string): string {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : TIMESTAMP_FORMATTER.format(date);
}

function formatMoney(value: number): string {
  return `Rs ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)}`;
}

function formatConsumption(value: number | null): string {
  if (value === null) return 'Unavailable';
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)} kWh`;
}

function detailPath(billId: string | undefined): string {
  return billId ? `/user/bills/${encodeURIComponent(billId)}` : '/user/bills';
}

function WelcomeSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="w-full space-y-3 sm:max-w-52">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard summary">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-7 w-36" />
          <Skeleton className="mt-4 h-3.5 w-28" />
        </div>
      ))}
    </div>
  );
}

function WelcomeBanner({ summary }: { summary: DashboardSummary }) {
  return (
    <PageHeader
      title={`Welcome, ${summary.user.name}`}
      subtitle={`${formatDate(REFERENCE_DATE)} · ${summary.zone.name}`}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]"
      actions={
        <div className="space-y-2 text-sm sm:text-right">
          <p>
            <span className="text-[var(--text-secondary)]">Last synced: </span>
            <span className="font-medium text-[var(--text-primary)]">
              {formatTimestamp(summary.meter.lastReadingAt)}
            </span>
          </p>
          <p className="text-[var(--text-secondary)]">
            Data source: Smart meter{' '}
            <span className="font-medium text-[var(--text-primary)]">
              {summary.meter.meterNumber}
            </span>
          </p>
        </div>
      }
    />
  );
}

function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const latestBill = summary.latestBill;
  const latestPaidBill = summary.latestPaidBill;
  const paymentDescription = latestPaidBill?.paidDate
    ? `Paid on ${formatDate(latestPaidBill.paidDate)}`
    : latestPaidBill
      ? 'Payment date unavailable'
      : 'No payment recorded';

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Account overview">
      <Link
        to="/user/meter-data"
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <StatCard
          title="Current consumption"
          value={formatConsumption(summary.currentConsumption)}
          description={
            summary.currentConsumptionSource === 'reading'
              ? 'From the latest meter reading'
              : summary.currentConsumptionSource === 'bill'
                ? 'From the latest bill'
                : 'No reading available'
          }
          className="h-full transition-colors hover:border-[var(--accent-border)]"
        />
      </Link>

      <Link
        to={detailPath(latestBill?.id)}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <StatCard
          title="This month’s bill"
          value={latestBill ? formatMoney(latestBill.amount) : 'No bill'}
          description={latestBill ? `Due ${formatDate(latestBill.dueDate)}` : 'No bill available'}
          className="h-full transition-colors hover:border-[var(--accent-border)]"
        />
      </Link>

      <Link
        to="/user/bills"
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <StatCard
          title="Outstanding balance"
          value={formatMoney(summary.outstandingBalance)}
          description="Pending and overdue bills"
          className="h-full transition-colors hover:border-[var(--accent-border)]"
        />
      </Link>

      <Link
        to="/user/bills"
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <StatCard
          title="Last payment"
          value={latestPaidBill ? formatMoney(latestPaidBill.amount) : 'No payment'}
          description={paymentDescription}
          className="h-full transition-colors hover:border-[var(--accent-border)]"
        />
      </Link>
    </section>
  );
}

function QuickActions({ latestPendingBillId }: { latestPendingBillId?: string }) {
  const actions = [
    { label: 'Pay bill', to: detailPath(latestPendingBillId) },
    { label: 'View bill history', to: '/user/bills' },
    { label: 'View detailed usage', to: '/user/meter-data' },
    { label: 'Manage notifications', to: '/profile?tab=notifications' },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="inline-flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--accent-border)] hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            {action.label}
            <span aria-hidden="true" className="text-[var(--text-muted)]">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ConsumptionChart({
  range,
  onRangeChange,
  isLoading,
  error,
  series,
}: {
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  isLoading: boolean;
  error: string | null;
  series: ReturnType<typeof useDashboardData>['consumption']['series'];
}) {
  return (
    <ChartCard
      title="Consumption overview"
      description="Quick view of usage across the selected period. Detailed analysis is on Meter Data."
      actions={<TimeRangeToggle value={range} onChange={onRangeChange} />}
    >
      {isLoading ? (
        <Skeleton className="h-[280px] w-full" />
      ) : error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </p>
      ) : series && series.points.length > 0 ? (
        <ChartWrapper height={280}>
          {(theme) => (
            <AreaChart data={series.points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={theme.gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.axisColor, fontSize: 12 }}
                minTickGap={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.axisColor, fontSize: 12 }}
                width={42}
              />
              <Tooltip
                contentStyle={theme.tooltipContentStyle}
                labelStyle={theme.tooltipLabelStyle}
                itemStyle={theme.tooltipItemStyle}
                formatter={(value) => [`${value} kWh`, 'Consumption']}
              />
              {series.points.some((point) => point.previousValue !== undefined) ? (
                <Area
                  type="monotone"
                  dataKey="previousValue"
                  name="Previous period"
                  stroke="var(--text-muted)"
                  strokeDasharray="4 4"
                  fill="transparent"
                  isAnimationActive={false}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey="value"
                name="Current period"
                stroke="var(--accent-text)"
                fill="var(--accent-soft)"
                fillOpacity={0.55}
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ChartWrapper>
      ) : (
        <p className="py-12 text-center text-sm text-[var(--text-secondary)]">
          No consumption data is available for this period.
        </p>
      )}
    </ChartCard>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState<TimeRange>('day');
  const { summary, isSummaryLoading, summaryError, consumption } = useDashboardData(range);

  return (
    <div className="space-y-6">
      {summary ? (
        <WelcomeBanner summary={summary} />
      ) : isSummaryLoading ? (
        <WelcomeSkeleton />
      ) : (
        <PageHeader
          title="End-user Dashboard"
          subtitle={`${formatDate(REFERENCE_DATE)} · Customer overview`}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]"
        />
      )}

      {summaryError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {summaryError}
        </p>
      ) : null}

      {isSummaryLoading ? (
        <StatCardsSkeleton />
      ) : summary ? (
        <SummaryCards summary={summary} />
      ) : null}

      <ConsumptionChart
        range={range}
        onRangeChange={setRange}
        isLoading={consumption.isLoading}
        error={consumption.error}
        series={consumption.series}
      />

      {summary ? <QuickActions latestPendingBillId={summary.latestPendingBill?.id} /> : null}
    </div>
  );
}

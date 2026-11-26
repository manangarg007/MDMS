import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartCard,
  ChartWrapper,
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  Skeleton,
  SkeletonTable,
  TimeRangeToggle,
  type TimeRangeOption,
} from '../../../shared/components';
import { DEMO_METER_ID, REFERENCE_DATE } from '../../../shared/config/demo';
import type { MeterReading, TableColumn, TimeRange } from '../../../shared/types';
import { useMeterData } from '../hooks/useMeterData';
import { formatDateTime } from '../utils/formatters';

const PAGE_SIZE = 10;

const RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function subtractDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

const DEFAULT_FROM = subtractDays(REFERENCE_DATE, 29);
const DEFAULT_TO = REFERENCE_DATE;

export default function MeterDataPage() {
  const [range, setRange] = useState<TimeRange>('month');
  const [from, setFrom] = useState<string>(DEFAULT_FROM);
  const [to, setTo] = useState<string>(DEFAULT_TO);
  const [page, setPage] = useState(1);
  const [dateError, setDateError] = useState<string | null>(null);

  const {
    meter,
    points,
    seriesLoading,
    seriesError,
    reloadSeries,
    readings,
    totalReadings,
    readingsLoading,
    readingsError,
    reloadReadings,
  } = useMeterData({
    range,
    from,
    to,
    page,
    limit: PAGE_SIZE,
  });

  const handleFromChange = (nextFrom: string) => {
    if (!nextFrom) return;
    if (nextFrom > to) {
      setDateError('Start date cannot be after end date.');
      return;
    }
    setDateError(null);
    setFrom(nextFrom);
    setPage(1);
  };

  const handleToChange = (nextTo: string) => {
    if (!nextTo) return;
    if (nextTo < from) {
      setDateError('End date cannot be before start date.');
      return;
    }
    setDateError(null);
    setTo(nextTo);
    setPage(1);
  };

  const handleResetDates = () => {
    setDateError(null);
    setFrom(DEFAULT_FROM);
    setTo(DEFAULT_TO);
    setPage(1);
  };

  const columns = useMemo<TableColumn<MeterReading>[]>(
    () => [
      {
        key: 'timestamp',
        header: 'Date/time',
        accessorKey: 'timestamp',
        render: (row) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatDateTime(row.timestamp)}
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
        header: 'Difference',
        accessorKey: 'consumption',
        align: 'right',
        render: (row) => `${row.consumption.toFixed(2)} kWh`,
      },
      {
        key: 'notes',
        header: 'Notes',
        accessorKey: 'notes',
        render: (row) => row.notes ?? '—',
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meter Data"
        subtitle={
          meter
            ? `Detailed consumption and interval readings for ${meter.meterNumber} (${meter.zoneName ?? 'Mangalore'}).`
            : `Detailed consumption and interval readings for meter ${DEMO_METER_ID}.`
        }
        actions={
          <TimeRangeToggle
            value={range}
            onChange={setRange}
            options={RANGE_OPTIONS}
          />
        }
      />

      {/* Date range filter bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label
              htmlFor="meter-date-from"
              className="block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              From date
            </label>
            <input
              id="meter-date-from"
              type="date"
              value={from}
              max={to}
              onChange={(e) => handleFromChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="meter-date-to"
              className="block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              To date
            </label>
            <input
              id="meter-date-to"
              type="date"
              value={to}
              min={from}
              onChange={(e) => handleToChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={handleResetDates}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Last 30 days
          </button>
        </div>

        {dateError ? (
          <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
            {dateError}
          </p>
        ) : null}
      </section>

      {/* Comparison line chart */}
      <ChartCard
        title="Consumption Comparison (Current vs Previous)"
        description={`Showing ${range}ly comparison in kWh`}
      >
        {seriesLoading ? (
          <Skeleton className="h-[280px] w-full rounded-lg" />
        ) : seriesError ? (
          <div
            role="alert"
            className="flex flex-col items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
          >
            <p>{seriesError}</p>
            <button
              type="button"
              onClick={reloadSeries}
              className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : points.length === 0 ? (
          <EmptyState
            title="No chart data available"
            description="No consumption series points were found for this time range."
          />
        ) : (
          <ChartWrapper height={280}>
            {(theme) => (
              <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={theme.gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke={theme.axisColor} fontSize={12} />
                <YAxis stroke={theme.axisColor} fontSize={12} unit=" kWh" width={64} />
                <Tooltip
                  contentStyle={theme.tooltipContentStyle}
                  labelStyle={theme.tooltipLabelStyle}
                  itemStyle={theme.tooltipItemStyle}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="previousValue"
                  name="Previous"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Current"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            )}
          </ChartWrapper>
        )}
      </ChartCard>

      {/* Readings table */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Meter readings ({from} to {to})
        </h2>

        {readingsLoading ? (
          <SkeletonTable rows={6} columns={4} />
        ) : readingsError ? (
          <div
            role="alert"
            className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
          >
            <p>{readingsError}</p>
            <button
              type="button"
              onClick={reloadReadings}
              className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : readings.length === 0 ? (
          <EmptyState
            title="No readings in this date range"
            description={`No meter readings were recorded between ${from} and ${to}.`}
            action={{ label: 'Reset to last 30 days', onClick: handleResetDates }}
          />
        ) : (
          <div className="space-y-4">
            <DataTable
              data={readings}
              columns={columns}
              initialPageSize={PAGE_SIZE}
              getRowId={(row) => row.id}
              searchKeys={['timestamp', 'notes']}
              searchPlaceholder="Search readings..."
            />

            <Pagination
              currentPage={page}
              totalItems={totalReadings}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </div>
  );
}

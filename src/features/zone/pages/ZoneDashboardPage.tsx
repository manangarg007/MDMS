import axios from 'axios';
import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  TimeRangeToggle,
} from '../../../shared/components';
import { Skeleton, SkeletonCard } from '../../../shared/components/loading';
import { DEMO_ZONE_ID } from '../../../shared/config/demo';
import type { Alert, ChartSeriesPoint, TimeRange } from '../../../shared/types';
import {
  getZoneAlertsPage,
  getZoneConsumptionTrend,
  getZoneDashboardOverview,
} from '../services';
import type { ZoneDashboardOverview } from '../types';

// ─── constants ───────────────────────────────────────────────────────────────

const ACTIVE_ZONE_STORAGE_KEY = 'mdms_active_zone_id';
const RECENT_ALERTS_LIMIT = 5;

// ─── helpers ─────────────────────────────────────────────────────────────────

function resolveActiveZoneId(searchParams: URLSearchParams): string {
  const fromQuery = searchParams.get('zoneId')?.trim();
  if (fromQuery) return fromQuery;

  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage
      .getItem(ACTIVE_ZONE_STORAGE_KEY)
      ?.trim();
    if (fromStorage) return fromStorage;
  }

  return DEMO_ZONE_ID;
}

function formatKwh(value: number): string {
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)} kWh`;
}

function calculateDeltaPercent(
  current: number,
  previous: number,
): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function ZoneDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading zone dashboard">
      {/* header */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      {/* chart skeleton */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]">
        <Skeleton className="mb-4 h-5 w-44" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>

      {/* alerts skeleton */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]">
        <Skeleton className="mb-4 h-5 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── meter status mini-bar ────────────────────────────────────────────────────

interface MeterStatusRowProps {
  active: number;
  maintenance: number;
  inactive: number;
  tampered: number;
}

function MeterStatusRow({
  active,
  maintenance,
  inactive,
  tampered,
}: MeterStatusRowProps) {
  const chips: { label: string; count: number; status: string }[] = [
    { label: 'Active', count: active, status: 'active' },
    { label: 'Maintenance', count: maintenance, status: 'maintenance' },
    { label: 'Inactive', count: inactive, status: 'inactive' },
    { label: 'Tampered', count: tampered, status: 'tampered' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(({ label, count, status }) => (
        <span
          key={status}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1 text-sm"
        >
          <StatusBadge status={status} size="sm" label={label} />
          <span className="font-semibold text-[var(--text-primary)]">
            {count}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── recent alert row ─────────────────────────────────────────────────────────

interface AlertRowProps {
  alert: Alert;
}

function AlertRow({ alert }: AlertRowProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          {alert.title}
        </p>
        {alert.meterId ? (
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Meter {alert.meterNumber ?? alert.meterId}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge status={alert.severity} size="sm" />
        <StatusBadge status={alert.status} size="sm" />
      </div>
      <span className="shrink-0 text-xs text-[var(--text-muted)]">
        {formatRelativeTime(alert.createdAt)}
      </span>
    </li>
  );
}

// ─── consumption chart ────────────────────────────────────────────────────────

interface ConsumptionChartProps {
  points: ChartSeriesPoint[];
}

function ConsumptionChart({ points }: ConsumptionChartProps) {
  const tooltipId = useId();

  if (points.length === 0) {
    return (
      <EmptyState
        title="No consumption data"
        description="No trend data is available for this period."
        className="min-h-40"
      />
    );
  }

  return (
    <ChartWrapper height={260}>
      {(theme) => (
        <AreaChart
          data={points}
          margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`${tooltipId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--accent)"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="var(--accent)"
                stopOpacity={0.03}
              />
            </linearGradient>
            <linearGradient
              id={`${tooltipId}-fill-prev`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--text-muted)"
                stopOpacity={0.15}
              />
              <stop
                offset="95%"
                stopColor="var(--text-muted)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.gridColor}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: theme.axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: theme.axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
            width={48}
          />

          <Tooltip
            contentStyle={theme.tooltipContentStyle}
            labelStyle={theme.tooltipLabelStyle}
            itemStyle={theme.tooltipItemStyle}
            formatter={(value: number) => [formatKwh(value), '']}
          />

          {/* previous period */}
          <Area
            type="monotone"
            dataKey="previousValue"
            name="Previous period"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill={`url(#${tooltipId}-fill-prev)`}
            dot={false}
            activeDot={false}
          />

          {/* current period */}
          <Area
            type="monotone"
            dataKey="value"
            name="This period"
            stroke="var(--accent)"
            strokeWidth={2}
            fill={`url(#${tooltipId}-fill)`}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--accent)' }}
          />
        </AreaChart>
      )}
    </ChartWrapper>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function ZoneDashboardPage() {
  const [searchParams] = useSearchParams();
  const zoneId = resolveActiveZoneId(searchParams);

  // overview (KPI + header)
  const [overview, setOverview] = useState<ZoneDashboardOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // chart
  const [chartRange, setChartRange] = useState<TimeRange>('month');
  const [chartPoints, setChartPoints] = useState<ChartSeriesPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // recent alerts
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const handleRetry = useCallback(() => {
    setReloadCount((prev) => prev + 1);
  }, []);

  // ── effect: load overview (zone info + KPIs + initial trend) ──────────────
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadOverview() {
      setOverviewLoading(true);
      setOverviewError(null);

      try {
        const data = await getZoneDashboardOverview(
          zoneId,
          'month',
          controller.signal,
        );
        if (!cancelled) {
          setOverview(data);
          // seed chart with the month trend already fetched in the overview
          setChartPoints(data.consumptionTrend);
          setChartRange('month');
        }
      } catch (err: unknown) {
        if (cancelled || axios.isCancel(err) || controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load zone dashboard metrics. Check that JSON Server is running.';
        setOverviewError(message);
      } finally {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [zoneId, reloadCount]);

  // ── effect: reload trend when chartRange changes (skip initial 'month') ───
  useEffect(() => {
    // skip the initial seed — overview already loaded 'month' data
    if (chartRange === 'month' && chartPoints.length > 0) return;

    const controller = new AbortController();
    let cancelled = false;

    async function loadTrend() {
      setChartLoading(true);
      try {
        const points = await getZoneConsumptionTrend(
          zoneId,
          chartRange,
          controller.signal,
        );
        if (!cancelled) setChartPoints(points);
      } catch {
        // non-critical: keep existing points on error
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    }

    void loadTrend();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // chartPoints intentionally excluded — we only re-run on range/zone change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, chartRange]);

  // ── effect: load recent alerts ────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadAlerts() {
      setAlertsLoading(true);
      try {
        const page = await getZoneAlertsPage(
          {
            zoneId,
            page: 1,
            limit: RECENT_ALERTS_LIMIT,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          },
          controller.signal,
        );
        if (!cancelled) setRecentAlerts(page.data);
      } catch {
        // non-critical: show empty state
      } finally {
        if (!cancelled) setAlertsLoading(false);
      }
    }

    void loadAlerts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [zoneId, reloadCount]);

  // ── loading state ─────────────────────────────────────────────────────────
  if (overviewLoading) {
    return <ZoneDashboardSkeleton />;
  }

  // ── error state ───────────────────────────────────────────────────────────
  if (overviewError || !overview) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Zone Dashboard"
          subtitle={`Zone ${zoneId} operations overview`}
          actions={
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Retry
            </button>
          }
        />

        <EmptyState
          title="Could not load zone dashboard"
          description={
            overviewError ?? 'No zone data was returned from the server.'
          }
          action={{ label: 'Try Again', onClick: handleRetry }}
        />
      </section>
    );
  }

  const { zone, kpis } = overview;
  const activeRatio =
    kpis.totalMeters > 0
      ? Math.round((kpis.activeMeters / kpis.totalMeters) * 100)
      : 0;
  const consumptionDelta = calculateDeltaPercent(
    kpis.monthlyConsumptionKwh,
    kpis.previousMonthlyConsumptionKwh,
  );

  return (
    <section className="space-y-6">
      {/* ── header ── */}
      <PageHeader
        title={`${zone.name} Zone Dashboard`}
        subtitle={`${zone.location} (${zone.pincode}) · Admin: ${zone.adminName ?? zone.adminId}`}
        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]"
        metadataBadge={
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--text-secondary)]">
              {zone.id}
            </span>
            <StatusBadge status={zone.status} />
          </div>
        }
        actions={
          <>
            <Link
              to="/zone/meters"
              className="inline-flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)]"
            >
              Zone Meters
            </Link>
            <Link
              to="/zone/alerts"
              className="inline-flex items-center rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              View Alerts
            </Link>
          </>
        }
      />

      {/* ── KPI stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Meters"
          value={kpis.totalMeters}
          description={`${kpis.totalUsers} customers in zone`}
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 12l4-3M12 7v2" strokeLinecap="round" />
            </svg>
          }
        />

        <StatCard
          title="Active Meters"
          value={kpis.activeMeters}
          trend={{
            value: `${activeRatio}%`,
            direction: activeRatio >= 80 ? 'up' : 'flat',
            tone: activeRatio >= 80 ? 'positive' : 'neutral',
            description: `${kpis.maintenanceMeters} maintenance · ${kpis.inactiveMeters} inactive`,
          }}
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                d="M22 11.08V12a10 10 0 11-5.93-9.14"
                strokeLinecap="round"
              />
              <path
                d="M22 4L12 14.01l-3-3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <StatCard
          title="Monthly Consumption"
          value={formatKwh(kpis.monthlyConsumptionKwh)}
          trend={
            consumptionDelta !== null
              ? {
                  value: `${Math.abs(consumptionDelta)}%`,
                  direction:
                    consumptionDelta > 0
                      ? 'up'
                      : consumptionDelta < 0
                        ? 'down'
                        : 'flat',
                  tone: consumptionDelta < 0 ? 'positive' : 'neutral',
                  description: 'vs last month',
                }
              : undefined
          }
          description={
            consumptionDelta === null ? 'Current billing period' : undefined
          }
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" />
            </svg>
          }
        />

        <StatCard
          title="Open Alerts"
          value={kpis.openAlerts}
          trend={{
            value: `${kpis.pendingAlerts} pending`,
            direction: kpis.pendingAlerts > 0 ? 'up' : 'flat',
            tone: kpis.pendingAlerts > 0 ? 'negative' : 'positive',
            description: `${kpis.tamperedMeters} tamper alert(s)`,
          }}
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 01-3.46 0"
                strokeLinecap="round"
              />
            </svg>
          }
        />
      </div>

      {/* ── consumption trend chart ── */}
      <ChartCard
        title="Consumption Trend"
        description="kWh consumed over the selected period (dashed = previous period)"
        actions={
          <TimeRangeToggle value={chartRange} onChange={setChartRange} />
        }
      >
        {chartLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : (
          <ConsumptionChart points={chartPoints} />
        )}
      </ChartCard>

      {/* ── meter status breakdown + recent alerts ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* meter status mini-overview */}
        <ChartCard
          title="Meter Status Breakdown"
          description="Live count of meters by operational status"
        >
          <MeterStatusRow
            active={kpis.activeMeters}
            maintenance={kpis.maintenanceMeters}
            inactive={kpis.inactiveMeters}
            tampered={kpis.tamperedMeters}
          />
        </ChartCard>

        {/* recent alerts */}
        <ChartCard
          title="Recent Alerts"
          description={`Latest ${RECENT_ALERTS_LIMIT} alerts in this zone`}
          actions={
            <Link
              to="/zone/alerts"
              className="text-sm font-medium text-[var(--accent)] transition hover:underline"
            >
              View all →
            </Link>
          }
        >
          {alertsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : recentAlerts.length === 0 ? (
            <EmptyState
              title="No recent alerts"
              description="This zone has no open or recent alerts."
              className="min-h-40 border-0 bg-transparent"
            />
          ) : (
            <ul className="space-y-2.5">
              {recentAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </ul>
          )}
        </ChartCard>
      </div>
    </section>
  );
}

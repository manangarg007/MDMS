import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
} from '../../../shared/components';
import { Skeleton, SkeletonCard } from '../../../shared/components/loading';
import { DEMO_ZONE_ID } from '../../../shared/config/demo';
import { getZoneDashboardOverview } from '../services';
import type { ZoneDashboardOverview } from '../types';

const ACTIVE_ZONE_STORAGE_KEY = 'mdms_active_zone_id';

function resolveActiveZoneId(searchParams: URLSearchParams): string {
  const fromQuery = searchParams.get('zoneId')?.trim();
  if (fromQuery) return fromQuery;

  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage.getItem(ACTIVE_ZONE_STORAGE_KEY)?.trim();
    if (fromStorage) return fromStorage;
  }

  return DEMO_ZONE_ID;
}

function formatKwh(value: number): string {
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)} kWh`;
}

function calculateDeltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function ZoneDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading zone dashboard">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

export default function ZoneDashboardPage() {
  const [searchParams] = useSearchParams();
  const zoneId = resolveActiveZoneId(searchParams);

  const [overview, setOverview] = useState<ZoneDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const handleRetry = useCallback(() => {
    setReloadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const data = await getZoneDashboardOverview(zoneId, 'month', controller.signal);
        if (!cancelled) {
          setOverview(data);
        }
      } catch (err: unknown) {
        if (cancelled || axios.isCancel(err) || controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load zone dashboard metrics. Check that JSON Server is running.';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [zoneId, reloadCount]);

  if (loading) {
    return <ZoneDashboardSkeleton />;
  }

  if (error || !overview) {
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
          description={error ?? 'No zone data was returned from the server.'}
          action={{
            label: 'Try Again',
            onClick: handleRetry,
          }}
        />
      </section>
    );
  }

  const { zone, kpis } = overview;
  const activeRatio =
    kpis.totalMeters > 0 ? Math.round((kpis.activeMeters / kpis.totalMeters) * 100) : 0;
  const consumptionDelta = calculateDeltaPercent(
    kpis.monthlyConsumptionKwh,
    kpis.previousMonthlyConsumptionKwh,
  );

  return (
    <section className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Meters"
          value={kpis.totalMeters}
          description={`${kpis.totalUsers} customers in zone`}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" />
              <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
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
                    consumptionDelta > 0 ? 'up' : consumptionDelta < 0 ? 'down' : 'flat',
                  tone: consumptionDelta < 0 ? 'positive' : 'neutral',
                  description: 'vs last month',
                }
              : undefined
          }
          description={consumptionDelta === null ? 'Current billing period' : undefined}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
            </svg>
          }
        />
      </div>
    </section>
  );
}

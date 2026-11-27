import http from '../../../services/http';
import type { Alert, ChartSeriesPoint, Meter, TimeRange, User, Zone } from '../../../shared/types';
import type {
  ZoneConsumptionSeries,
  ZoneDashboardOverview,
  ZoneKpiSummary,
} from '../types';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isTamperAlert(alert: Alert): boolean {
  const haystack = `${alert.title} ${alert.message}`.toLowerCase();
  return haystack.includes('tamper');
}

export async function getZoneById(zoneId: string, signal?: AbortSignal): Promise<Zone> {
  const response = await http.get<Zone>(`/zones/${encodeURIComponent(zoneId)}`, {
    signal,
  });
  return response.data;
}

export async function getZoneConsumptionTrend(
  zoneId: string,
  range: TimeRange = 'month',
  signal?: AbortSignal,
): Promise<ChartSeriesPoint[]> {
  const response = await http.get<ZoneConsumptionSeries[]>('/consumptionSeries', {
    params: {
      scope: 'zone',
      scopeId: zoneId,
      range,
    },
    signal,
  });
  return response.data[0]?.points ?? [];
}

export async function getZoneKpiSummary(
  zoneId: string,
  signal?: AbortSignal,
): Promise<ZoneKpiSummary> {
  const [metersRes, usersRes, alertsRes, monthTrend] = await Promise.all([
    http.get<Meter[]>('/meters', {
      params: { zoneId },
      signal,
    }),
    http.get<User[]>('/users', {
      params: { zoneId, role: 'end-user' },
      signal,
    }),
    http.get<Alert[]>('/alerts', {
      params: { zoneId },
      signal,
    }),
    getZoneConsumptionTrend(zoneId, 'month', signal),
  ]);

  const meters = metersRes.data;
  const users = usersRes.data;
  const alerts = alertsRes.data;

  let activeMeters = 0;
  let inactiveMeters = 0;
  let maintenanceMeters = 0;

  for (const meter of meters) {
    if (meter.status === 'active') activeMeters += 1;
    else if (meter.status === 'deactivated') inactiveMeters += 1;
    else if (meter.status === 'maintenance') maintenanceMeters += 1;
  }

  const tamperedMeterIds = new Set<string>();
  let openAlerts = 0;
  let pendingAlerts = 0;

  for (const alert of alerts) {
    if (alert.status !== 'resolved') {
      openAlerts += 1;
      if (alert.meterId && isTamperAlert(alert)) {
        tamperedMeterIds.add(alert.meterId);
      }
    }
    if (alert.status === 'pending') {
      pendingAlerts += 1;
    }
  }

  let monthlyConsumptionKwh = 0;
  let previousMonthlyConsumptionKwh = 0;
  for (const point of monthTrend) {
    monthlyConsumptionKwh += point.value;
    previousMonthlyConsumptionKwh += point.previousValue ?? 0;
  }

  return {
    totalMeters: meters.length,
    activeMeters,
    inactiveMeters,
    maintenanceMeters,
    tamperedMeters: tamperedMeterIds.size,
    totalUsers: users.length,
    monthlyConsumptionKwh: round2(monthlyConsumptionKwh),
    previousMonthlyConsumptionKwh: round2(previousMonthlyConsumptionKwh),
    openAlerts,
    pendingAlerts,
  };
}

export async function getZoneDashboardOverview(
  zoneId: string,
  range: TimeRange = 'month',
  signal?: AbortSignal,
): Promise<ZoneDashboardOverview> {
  const [zone, kpis, consumptionTrend] = await Promise.all([
    getZoneById(zoneId, signal),
    getZoneKpiSummary(zoneId, signal),
    getZoneConsumptionTrend(zoneId, range, signal),
  ]);

  return {
    zone,
    kpis,
    consumptionTrend,
  };
}

import http from '../../../services/http';
import type { ChartSeriesPoint, Meter, MeterReading } from '../../../shared/types';
import type {
  ZoneReportData,
  ZoneReportQuery,
  ZoneReportSummaryRow,
} from '../types';
import { getZoneConsumptionTrend } from './zoneDashboardService';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toDayStartIso(date?: string): string | undefined {
  const trimmed = date?.trim();
  if (!trimmed) return undefined;
  return trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00.000Z`;
}

function toDayEndIso(date?: string): string | undefined {
  const trimmed = date?.trim();
  if (!trimmed) return undefined;
  return trimmed.includes('T') ? trimmed : `${trimmed}T23:59:59.999Z`;
}

function filterReadingsByDateRange(
  readings: MeterReading[],
  from?: string,
  to?: string,
): MeterReading[] {
  const fromIso = toDayStartIso(from);
  const toIso = toDayEndIso(to);

  return readings.filter((reading) => {
    // Exclude hourly breakdown rows when a daily closing row exists on the same day,
    // or keep all readings if only daily rows exist for the meter.
    if (fromIso && reading.timestamp < fromIso) return false;
    if (toIso && reading.timestamp > toIso) return false;
    return true;
  });
}

function aggregateReadingsToDailyTrend(readings: MeterReading[]): ChartSeriesPoint[] {
  const byDate = new Map<string, number>();

  for (const reading of readings) {
    const day = reading.timestamp.slice(0, 10);
    // Avoid double counting hourly + closing row on 2026-11-25 for M001
    if (reading.notes === 'Daily closing reading') {
      byDate.set(day, reading.consumption);
      continue;
    }
    if (reading.notes === 'Peak hour interval' || reading.timestamp.endsWith(':00:00.000Z')) {
      continue;
    }
    byDate.set(day, round2((byDate.get(day) ?? 0) + reading.consumption));
  }

  return Array.from(byDate.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, value]) => ({
      label,
      value: round2(value),
    }));
}

function summarizeMeterReadings(meter: Meter, readings: MeterReading[]): ZoneReportSummaryRow {
  const dailyReadings = readings.filter(
    (r) => r.notes !== 'Peak hour interval' && !r.timestamp.endsWith(':00:00.000Z'),
  );
  const source = dailyReadings.length > 0 ? dailyReadings : readings;

  let totalConsumptionKwh = 0;
  for (const item of source) {
    totalConsumptionKwh += item.consumption;
  }

  const totalReadings = source.length;
  const averageConsumptionKwh =
    totalReadings > 0 ? round2(totalConsumptionKwh / totalReadings) : 0;

  return {
    id: meter.id,
    meterId: meter.id,
    meterNumber: meter.meterNumber,
    ownerName: meter.ownerName ?? meter.ownerId,
    tariffCategory: meter.tariffCategory,
    status: meter.status,
    totalReadings,
    totalConsumptionKwh: round2(totalConsumptionKwh),
    averageConsumptionKwh,
    lastReading: meter.lastReading,
    lastReadingAt: meter.lastReadingAt,
  };
}

export async function getZoneMeterOptions(
  zoneId: string,
  signal?: AbortSignal,
): Promise<Meter[]> {
  const response = await http.get<Meter[]>('/meters', {
    params: { zoneId, _sort: 'meterNumber' },
    signal,
  });
  return response.data;
}

export async function getZoneUsageTrend(
  query: ZoneReportQuery,
  signal?: AbortSignal,
): Promise<ChartSeriesPoint[]> {
  const selectedMeterId =
    query.meterId && query.meterId !== 'all' ? query.meterId : undefined;

  if (selectedMeterId) {
    const response = await http.get<MeterReading[]>('/readings', {
      params: {
        meterId: selectedMeterId,
        _sort: 'timestamp',
      },
      signal,
    });
    const filtered = filterReadingsByDateRange(response.data, query.from, query.to);
    return aggregateReadingsToDailyTrend(filtered);
  }

  return getZoneConsumptionTrend(query.zoneId, query.range ?? 'month', signal);
}

export async function getZoneReportSummary(
  query: ZoneReportQuery,
  signal?: AbortSignal,
): Promise<ZoneReportData> {
  const selectedMeterId =
    query.meterId && query.meterId !== 'all' ? query.meterId : undefined;

  const [meters, trend] = await Promise.all([
    getZoneMeterOptions(query.zoneId, signal),
    getZoneUsageTrend(query, signal),
  ]);

  const targetMeters = selectedMeterId
    ? meters.filter((meter) => meter.id === selectedMeterId)
    : meters;

  const readingsResponses = await Promise.all(
    targetMeters.map((meter) =>
      http.get<MeterReading[]>('/readings', {
        params: { meterId: meter.id, _sort: 'timestamp' },
        signal,
      }),
    ),
  );

  const summaryRows = targetMeters.map((meter, index) => {
    const filtered = filterReadingsByDateRange(
      readingsResponses[index]?.data ?? [],
      query.from,
      query.to,
    );
    return summarizeMeterReadings(meter, filtered);
  });

  let totalConsumptionKwh = 0;
  for (const row of summaryRows) {
    totalConsumptionKwh += row.totalConsumptionKwh;
  }

  const meterCount = summaryRows.length;
  const averageConsumptionKwh =
    meterCount > 0 ? round2(totalConsumptionKwh / meterCount) : 0;

  return {
    trend,
    summaryRows,
    totalConsumptionKwh: round2(totalConsumptionKwh),
    averageConsumptionKwh,
    meterCount,
  };
}

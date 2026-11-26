import { useCallback, useEffect, useState } from 'react';
import { DEMO_METER_ID, DEMO_USER_ID } from '../../../shared/config/demo';
import type { ChartSeriesPoint, Meter, MeterReading, TimeRange } from '../../../shared/types';
import { getConsumptionSeries } from '../services/consumptionService';
import { getMeterById, getReadings } from '../services/meterService';

interface SeriesState {
  resolvedKey: string;
  points: ChartSeriesPoint[];
  error: string | null;
}

interface ReadingsState {
  resolvedKey: string;
  readings: MeterReading[];
  total: number;
  error: string | null;
}

export interface UseMeterDataOptions {
  range: TimeRange;
  from: string;
  to: string;
  page: number;
  limit?: number;
}

export function useMeterData({
  range,
  from,
  to,
  page,
  limit = 10,
}: UseMeterDataOptions) {
  const [meter, setMeter] = useState<Meter | null>(null);
  const [seriesReloadCount, setSeriesReloadCount] = useState(0);
  const [readingsReloadCount, setReadingsReloadCount] = useState(0);

  const seriesKey = `${range}-${seriesReloadCount}`;
  const readingsKey = `${from}-${to}-${page}-${limit}-${readingsReloadCount}`;

  const [seriesState, setSeriesState] = useState<SeriesState>({
    resolvedKey: '',
    points: [],
    error: null,
  });

  const [readingsState, setReadingsState] = useState<ReadingsState>({
    resolvedKey: '',
    readings: [],
    total: 0,
    error: null,
  });

  const reloadSeries = useCallback(() => {
    setSeriesReloadCount((prev) => prev + 1);
  }, []);

  const reloadReadings = useCallback(() => {
    setReadingsReloadCount((prev) => prev + 1);
  }, []);

  // Load demo meter metadata once
  useEffect(() => {
    let active = true;
    getMeterById(DEMO_METER_ID)
      .then((data) => {
        if (active) setMeter(data);
      })
      .catch(() => {
        // Non-critical metadata; page still works with DEMO_METER_ID
      });
    return () => {
      active = false;
    };
  }, []);

  // Load consumption series for the selected TimeRange
  useEffect(() => {
    let active = true;
    getConsumptionSeries('user', DEMO_USER_ID, range)
      .then((series) => {
        if (!active) return;
        setSeriesState({
          resolvedKey: seriesKey,
          points: series.points,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setSeriesState({
          resolvedKey: seriesKey,
          points: [],
          error: 'Unable to load consumption chart data.',
        });
      });

    return () => {
      active = false;
    };
  }, [range, seriesKey]);

  // Load paginated meter readings for the selected date range
  useEffect(() => {
    let active = true;
    getReadings({
      meterId: DEMO_METER_ID,
      from: `${from}T00:00:00.000Z`,
      to: `${to}T23:59:59.999Z`,
      page,
      limit,
    })
      .then((result) => {
        if (!active) return;
        setReadingsState({
          resolvedKey: readingsKey,
          readings: result.items,
          total: result.total,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setReadingsState({
          resolvedKey: readingsKey,
          readings: [],
          total: 0,
          error: 'Unable to load meter readings. Make sure JSON Server is running on port 3000.',
        });
      });

    return () => {
      active = false;
    };
  }, [from, to, page, limit, readingsKey]);

  const seriesLoading = seriesState.resolvedKey !== seriesKey;
  const readingsLoading = readingsState.resolvedKey !== readingsKey;

  return {
    meter,
    points: seriesState.points,
    seriesLoading,
    seriesError: seriesLoading ? null : seriesState.error,
    reloadSeries,
    readings: readingsState.readings,
    totalReadings: readingsState.total,
    readingsLoading,
    readingsError: readingsLoading ? null : readingsState.error,
    reloadReadings,
  };
}

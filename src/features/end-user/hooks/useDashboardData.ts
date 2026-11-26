import { useEffect, useState } from 'react';
import {
  DEMO_METER_ID,
  DEMO_USER_ID,
  DEMO_ZONE_ID,
} from '../../../shared/config/demo';
import type { TimeRange } from '../../../shared/types';
import { getBills, getLatestBill, getOutstandingBills } from '../services/billService';
import { getConsumptionSeries } from '../services/consumptionService';
import { getMeterById, getReadings } from '../services/meterService';
import { getUserById, getZoneById } from '../services/profileService';
import type { ConsumptionSeries } from '../types/consumption';
import type { DashboardSummary } from '../types/dashboard';

interface ConsumptionState {
  range: TimeRange | null;
  series: ConsumptionSeries | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseDashboardDataResult {
  summary: DashboardSummary | null;
  isSummaryLoading: boolean;
  summaryError: string | null;
  consumption: ConsumptionState;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function useDashboardData(range: TimeRange): UseDashboardDataResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [consumption, setConsumption] = useState<ConsumptionState>({
    range: null,
    series: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isCurrent = true;

    Promise.all([
      getUserById(DEMO_USER_ID),
      getZoneById(DEMO_ZONE_ID),
      getMeterById(DEMO_METER_ID),
      getLatestBill(DEMO_USER_ID),
      getOutstandingBills(DEMO_USER_ID),
      getBills({ userId: DEMO_USER_ID, status: 'pending', page: 1, limit: 1 }),
      getBills({ userId: DEMO_USER_ID, status: 'paid', page: 1, limit: 1 }),
      getReadings({ meterId: DEMO_METER_ID, page: 1, limit: 1 }),
    ])
      .then(
        ([
          user,
          zone,
          meter,
          latestBill,
          outstandingBills,
          pendingBills,
          paidBills,
          readings,
        ]) => {
          if (!isCurrent) return;

          const latestReading = readings.items[0];
          setSummary({
            user,
            zone,
            meter,
            latestBill,
            latestPendingBill: pendingBills.items[0] ?? null,
            latestPaidBill: paidBills.items[0] ?? null,
            currentConsumption: latestReading?.consumption ?? latestBill?.units ?? null,
            currentConsumptionSource: latestReading
              ? 'reading'
              : latestBill
                ? 'bill'
                : null,
            outstandingBalance: outstandingBills.reduce(
              (total, bill) => total + bill.amount,
              0,
            ),
          });
          setSummaryError(null);
        },
      )
      .catch((error: unknown) => {
        if (isCurrent) {
          setSummaryError(`Unable to load dashboard data: ${getErrorMessage(error)}`);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsSummaryLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getConsumptionSeries('user', DEMO_USER_ID, range)
      .then((series) => {
        if (isCurrent) {
          setConsumption({ range, series, isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setConsumption({
            range,
            series: null,
            isLoading: false,
            error: `Unable to load consumption data: ${getErrorMessage(error)}`,
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [range]);

  const activeConsumption =
    consumption.range === range
      ? consumption
      : { range, series: null, isLoading: true, error: null };

  return {
    summary,
    isSummaryLoading,
    summaryError,
    consumption: activeConsumption,
  };
}

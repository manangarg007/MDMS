import { useCallback, useEffect, useState } from 'react';
import { DEMO_USER_ID } from '../../../shared/config/demo';
import type { Bill, BillStatus } from '../../../shared/types';
import { getBills } from '../services/billService';

export interface UseBillsOptions {
  status?: BillStatus;
  page: number;
  limit?: number;
}

interface BillsState {
  resolvedKey: string;
  bills: Bill[];
  total: number;
  error: string | null;
}

export function useBills({ status, page, limit = 10 }: UseBillsOptions) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${status ?? 'all'}-${page}-${limit}-${reloadCount}`;

  const [state, setState] = useState<BillsState>({
    resolvedKey: '',
    bills: [],
    total: 0,
    error: null,
  });

  const reload = useCallback(() => {
    setReloadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;

    getBills({
      userId: DEMO_USER_ID,
      status,
      page,
      limit,
    })
      .then((result) => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          bills: result.items,
          total: result.total,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          bills: [],
          total: 0,
          error: 'Unable to load your bills. Make sure JSON Server is running on port 3000.',
        });
      });

    return () => {
      active = false;
    };
  }, [status, page, limit, requestKey]);

  const loading = state.resolvedKey !== requestKey;

  return {
    bills: state.bills,
    total: state.total,
    loading,
    error: loading ? null : state.error,
    reload,
  };
}

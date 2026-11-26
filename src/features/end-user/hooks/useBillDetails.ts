import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import type { Bill, BillDay } from '../../../shared/types';
import { getBillById, getBillDays } from '../services/billService';

interface BillDetailsState {
  resolvedKey: string;
  bill: Bill | null;
  billDays: BillDay[];
  notFound: boolean;
  error: string | null;
}

export function useBillDetails(billId?: string) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${billId ?? 'missing'}-${reloadCount}`;

  const [state, setState] = useState<BillDetailsState>({
    resolvedKey: '',
    bill: null,
    billDays: [],
    notFound: false,
    error: null,
  });

  const reload = useCallback(() => {
    setReloadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!billId) {
      return;
    }

    let active = true;

    Promise.all([getBillById(billId), getBillDays(billId)])
      .then(([bill, billDays]) => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          bill,
          billDays,
          notFound: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const is404 = axios.isAxiosError(err) && err.response?.status === 404;
        setState({
          resolvedKey: requestKey,
          bill: null,
          billDays: [],
          notFound: is404,
          error: is404
            ? null
            : 'Unable to load bill details. Make sure JSON Server is running on port 3000.',
        });
      });

    return () => {
      active = false;
    };
  }, [billId, requestKey]);

  const loading = Boolean(billId) && state.resolvedKey !== requestKey;

  return {
    bill: state.bill,
    billDays: state.billDays,
    loading,
    notFound: !billId || (!loading && state.notFound),
    error: loading ? null : state.error,
    reload,
  };
}

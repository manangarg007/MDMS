import http from '../../../services/http';
import { fetchPaginatedList } from '../../../services/listQuery';
import type { Bill, BillDay, BillStatus, PaginatedResult } from '../../../shared/types';

export interface GetBillsParams {
  userId: string;
  status?: BillStatus;
  page: number;
  limit: number;
}

export async function getBills({
  userId,
  status,
  page,
  limit,
}: GetBillsParams): Promise<PaginatedResult<Bill>> {
  return fetchPaginatedList<Bill>('/bills', {
    page,
    limit,
    sortBy: 'month',
    order: 'desc',
    filters: { userId, status },
  });
}

export async function getBillById(id: string): Promise<Bill> {
  const response = await http.get<Bill>(`/bills/${encodeURIComponent(id)}`);
  return response.data;
}

export async function getBillDays(billId: string): Promise<BillDay[]> {
  const response = await http.get<BillDay[]>('/billDays', {
    params: { billId, _sort: 'date' },
  });
  return response.data;
}

export async function getLatestBill(userId: string): Promise<Bill | null> {
  const result = await getBills({ userId, page: 1, limit: 1 });
  return result.items[0] ?? null;
}

export async function getOutstandingBills(userId: string): Promise<Bill[]> {
  const [pending, overdue] = await Promise.all([
    http.get<Bill[]>('/bills', {
      params: { userId, status: 'pending', _sort: '-month' },
    }),
    http.get<Bill[]>('/bills', {
      params: { userId, status: 'overdue', _sort: '-month' },
    }),
  ]);

  return [...pending.data, ...overdue.data];
}

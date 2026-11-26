import http from '../../../services/http';
import { fetchPaginatedList } from '../../../services/listQuery';
import type { Meter, MeterReading, PaginatedResult } from '../../../shared/types';

export interface GetReadingsParams {
  meterId: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export async function getMeterById(id: string): Promise<Meter> {
  const response = await http.get<Meter>(`/meters/${encodeURIComponent(id)}`);
  return response.data;
}

export async function getReadings({
  meterId,
  from,
  to,
  page,
  limit,
}: GetReadingsParams): Promise<PaginatedResult<MeterReading>> {
  return fetchPaginatedList<MeterReading>('/readings', {
    page,
    limit,
    sortBy: 'timestamp',
    order: 'desc',
    filters: {
      meterId,
      'timestamp:gte': from,
      'timestamp:lte': to,
    },
  });
}

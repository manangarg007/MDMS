import http from '../../../services/http';
import type { JsonServerPage } from '../../../services/tableQuery';
import { fetchJsonServerPage } from '../../../services/tableQuery';
import type { Meter, MeterReading, MeterStatus } from '../../../shared/types';
import type {
  CreateZoneMeterInput,
  UpdateZoneMeterInput,
  ZoneMetersQuery,
} from '../types';

const METER_SEARCH_FIELDS = ['id', 'meterNumber', 'ownerName', 'address'];

export async function getZoneMetersPage(
  query: ZoneMetersQuery,
  signal?: AbortSignal,
): Promise<JsonServerPage<Meter>> {
  return fetchJsonServerPage<Meter>(
    '/meters',
    {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search,
      filters: {
        zoneId: query.zoneId,
        status: query.status,
        tariffCategory: query.tariffCategory,
      },
    },
    signal,
    {
      searchFields: METER_SEARCH_FIELDS,
    },
  );
}

export async function getZoneMeterById(
  meterId: string,
  signal?: AbortSignal,
): Promise<Meter> {
  const response = await http.get<Meter>(`/meters/${encodeURIComponent(meterId)}`, {
    signal,
  });
  return response.data;
}

export async function getZoneMeterReadings(
  meterId: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<MeterReading[]> {
  const result = await fetchJsonServerPage<MeterReading>(
    '/readings',
    {
      page: 1,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      filters: { meterId },
    },
    signal,
  );
  return result.data;
}

export async function createMeter(payload: CreateZoneMeterInput): Promise<Meter> {
  const body: Omit<Meter, 'id'> = {
    meterNumber: payload.meterNumber,
    ownerId: payload.ownerId,
    ownerName: payload.ownerName,
    zoneId: payload.zoneId,
    zoneName: payload.zoneName,
    address: payload.address,
    status: payload.status ?? 'active',
    lastReading: payload.lastReading ?? 0,
    lastReadingAt: new Date().toISOString(),
    installedDate: payload.installedDate,
    tariffCategory: payload.tariffCategory,
  };

  const response = await http.post<Meter>('/meters', body);
  return response.data;
}

export async function updateMeter(
  meterId: string,
  payload: UpdateZoneMeterInput,
): Promise<Meter> {
  const response = await http.patch<Meter>(
    `/meters/${encodeURIComponent(meterId)}`,
    payload,
  );
  return response.data;
}

export async function updateMeterStatus(
  meterId: string,
  status: MeterStatus,
): Promise<Meter> {
  return updateMeter(meterId, { status });
}

export async function deleteMeter(meterId: string): Promise<void> {
  await http.delete(`/meters/${encodeURIComponent(meterId)}`);
}

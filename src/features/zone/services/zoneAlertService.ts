import http from '../../../services/http';
import type { JsonServerPage } from '../../../services/tableQuery';
import { fetchJsonServerPage } from '../../../services/tableQuery';
import type { Alert, AlertStatus } from '../../../shared/types';
import type { ZoneAlertsQuery } from '../types';

const ALERT_SEARCH_FIELDS = ['id', 'title', 'message', 'meterId'];

export async function getZoneAlertsPage(
  query: ZoneAlertsQuery,
  signal?: AbortSignal,
): Promise<JsonServerPage<Alert>> {
  return fetchJsonServerPage<Alert>(
    '/alerts',
    {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
      search: query.search,
      filters: {
        zoneId: query.zoneId,
        severity: query.severity,
        status: query.status,
        meterId: query.meterId,
      },
    },
    signal,
    {
      searchFields: ALERT_SEARCH_FIELDS,
    },
  );
}

export async function getZoneAlertById(
  alertId: string,
  signal?: AbortSignal,
): Promise<Alert> {
  const response = await http.get<Alert>(`/alerts/${encodeURIComponent(alertId)}`, {
    signal,
  });
  return response.data;
}

export async function updateZoneAlertStatus(
  alertId: string,
  status: AlertStatus,
): Promise<Alert> {
  const now = new Date().toISOString();
  const payload: Partial<Alert> = { status };

  if (status === 'acknowledged') {
    payload.acknowledgedAt = now;
  } else if (status === 'resolved') {
    payload.resolvedAt = now;
  }

  const response = await http.patch<Alert>(
    `/alerts/${encodeURIComponent(alertId)}`,
    payload,
  );
  return response.data;
}

export async function acknowledgeZoneAlert(alertId: string): Promise<Alert> {
  return updateZoneAlertStatus(alertId, 'acknowledged');
}

export async function resolveZoneAlert(alertId: string): Promise<Alert> {
  return updateZoneAlertStatus(alertId, 'resolved');
}

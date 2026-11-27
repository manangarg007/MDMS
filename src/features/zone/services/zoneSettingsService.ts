import http from '../../../services/http';
import type { User, Zone, ZoneSettings } from '../../../shared/types';
import type {
  UpdateZoneAdminProfileInput,
  UpdateZoneSettingsInput,
  ZoneProfileOverview,
} from '../types';

export async function getZoneSettings(
  zoneId: string,
  signal?: AbortSignal,
): Promise<ZoneSettings> {
  const response = await http.get<ZoneSettings[]>('/settings', {
    params: { zoneId },
    signal,
  });

  const record = response.data[0];
  if (!record) {
    throw new Error(`No zone settings found for zone ${zoneId}.`);
  }

  return record;
}

export async function updateZoneSettings(
  settingsId: string,
  payload: UpdateZoneSettingsInput,
): Promise<ZoneSettings> {
  const response = await http.patch<ZoneSettings>(
    `/settings/${encodeURIComponent(settingsId)}`,
    payload,
  );
  return response.data;
}

export async function getZoneAdminProfile(
  zoneId: string,
  signal?: AbortSignal,
): Promise<ZoneProfileOverview> {
  const zoneRes = await http.get<Zone>(`/zones/${encodeURIComponent(zoneId)}`, {
    signal,
  });
  const zone = zoneRes.data;

  if (!zone.adminId) {
    return { zone, admin: null };
  }

  const adminRes = await http.get<User>(
    `/users/${encodeURIComponent(zone.adminId)}`,
    { signal },
  );

  return {
    zone,
    admin: adminRes.data,
  };
}

export async function updateZoneAdminProfile(
  adminId: string,
  payload: UpdateZoneAdminProfileInput,
): Promise<User> {
  const response = await http.patch<User>(
    `/users/${encodeURIComponent(adminId)}`,
    payload,
  );
  return response.data;
}

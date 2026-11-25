import http from '../../../services/http';
import type { Meter, User } from '../../../shared/types';

export async function getZoneMeters(zoneId?: string): Promise<Meter[]> {
  const response = await http.get<Meter[]>('/meters', {
    params: zoneId ? { zoneId } : undefined,
  });
  return response.data;
}

export async function getZoneUsers(zoneId?: string): Promise<User[]> {
  const response = await http.get<User[]>('/users', {
    params: zoneId ? { zoneId } : undefined,
  });
  return response.data;
}

import http from '../../../services/http';
import type { User, Zone } from '../../../shared/types';

export async function getUserById(id: string): Promise<User> {
  const response = await http.get<User>(`/users/${encodeURIComponent(id)}`);
  return response.data;
}

export async function getZoneById(id: string): Promise<Zone> {
  const response = await http.get<Zone>(`/zones/${encodeURIComponent(id)}`);
  return response.data;
}

import http from '../../../services/http';
import type { User } from '../../../shared/types';

export async function getAuthDemoUsers(): Promise<User[]> {
  const response = await http.get<User[]>('/users');
  return response.data;
}

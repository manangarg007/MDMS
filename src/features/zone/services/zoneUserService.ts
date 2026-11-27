import http from '../../../services/http';
import type { JsonServerPage } from '../../../services/tableQuery';
import { fetchJsonServerPage } from '../../../services/tableQuery';
import type { Meter, User, UserStatus } from '../../../shared/types';
import type {
  UpdateZoneUserInput,
  ZoneUserDetails,
  ZoneUsersQuery,
} from '../types';

const USER_SEARCH_FIELDS = ['id', 'name', 'email', 'phone'];

export async function getZoneUsersPage(
  query: ZoneUsersQuery,
  signal?: AbortSignal,
): Promise<JsonServerPage<User>> {
  return fetchJsonServerPage<User>(
    '/users',
    {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search,
      filters: {
        zoneId: query.zoneId,
        role: query.role ?? 'end-user',
        status: query.status,
      },
    },
    signal,
    {
      searchFields: USER_SEARCH_FIELDS,
    },
  );
}

export async function getZoneUserById(
  userId: string,
  signal?: AbortSignal,
): Promise<User> {
  const response = await http.get<User>(`/users/${encodeURIComponent(userId)}`, {
    signal,
  });
  return response.data;
}

export async function getZoneUserDetails(
  userId: string,
  signal?: AbortSignal,
): Promise<ZoneUserDetails> {
  const [user, metersRes] = await Promise.all([
    getZoneUserById(userId, signal),
    http.get<Meter[]>('/meters', {
      params: { ownerId: userId },
      signal,
    }),
  ]);

  return {
    user,
    meters: metersRes.data,
  };
}

export async function updateZoneUser(
  userId: string,
  payload: UpdateZoneUserInput,
): Promise<User> {
  const response = await http.patch<User>(
    `/users/${encodeURIComponent(userId)}`,
    payload,
  );
  return response.data;
}

export async function updateZoneUserStatus(
  userId: string,
  status: UserStatus,
): Promise<User> {
  return updateZoneUser(userId, { status });
}

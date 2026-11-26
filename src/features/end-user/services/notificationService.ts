import http from '../../../services/http';
import type { NotificationItem } from '../../../shared/types';

export interface GetNotificationsParams {
  userId: string;
  unreadOnly?: boolean;
}

export async function getNotifications({
  userId,
  unreadOnly = false,
}: GetNotificationsParams): Promise<NotificationItem[]> {
  const response = await http.get<NotificationItem[]>('/notifications', {
    params: {
      userId,
      _sort: '-createdAt',
      ...(unreadOnly ? { read: false } : {}),
    },
  });
  return response.data;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getNotifications({ userId, unreadOnly: true });
  return notifications.length;
}

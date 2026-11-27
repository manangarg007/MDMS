import { useCallback, useEffect, useState } from 'react';
import { DEMO_USER_ID } from '../../../shared/config/demo';
import type { NotificationItem } from '../../../shared/types';
import { getNotifications, getUnreadCount } from '../services/notificationService';

interface NotificationsState {
  resolvedKey: string;
  notifications: NotificationItem[];
  unreadCount: number;
  error: string | null;
}

export function useNotifications(unreadOnly: boolean) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${unreadOnly ? 'unread' : 'all'}-${reloadCount}`;

  const [state, setState] = useState<NotificationsState>({
    resolvedKey: '',
    notifications: [],
    unreadCount: 0,
    error: null,
  });

  const reload = useCallback(() => {
    setReloadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      getNotifications({ userId: DEMO_USER_ID, unreadOnly }),
      getUnreadCount(DEMO_USER_ID),
    ])
      .then(([notifications, unreadCount]) => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          notifications,
          unreadCount,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          notifications: [],
          unreadCount: 0,
          error: 'Unable to load notifications. Make sure JSON Server is running on port 3000.',
        });
      });

    return () => {
      active = false;
    };
  }, [unreadOnly, requestKey]);

  const loading = state.resolvedKey !== requestKey;

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading,
    error: loading ? null : state.error,
    reload,
  };
}

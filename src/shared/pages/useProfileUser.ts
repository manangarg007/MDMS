import { useCallback, useEffect, useState } from 'react';
import { getUserById } from '../../features/end-user/services/profileService';
import { DEMO_USER_ID } from '../config/demo';
import { getStoredRole } from '../routes';
import type { User, UserRole } from '../types';

const DEMO_USER_BY_ROLE: Record<UserRole, string> = {
  'end-user': DEMO_USER_ID,
  zone: 'ZA01',
  enterprise: 'E01',
};

interface ProfileUserState {
  resolvedKey: string;
  user: User | null;
  error: string | null;
}

export function useProfileUser() {
  const role = getStoredRole();
  const userId = DEMO_USER_BY_ROLE[role];
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${userId}-${reloadCount}`;

  const [state, setState] = useState<ProfileUserState>({
    resolvedKey: '',
    user: null,
    error: null,
  });

  const reload = useCallback(() => {
    setReloadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;

    getUserById(userId)
      .then((user) => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          user,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          resolvedKey: requestKey,
          user: null,
          error: 'Unable to load profile details. Make sure JSON Server is running on port 3000.',
        });
      });

    return () => {
      active = false;
    };
  }, [userId, requestKey]);

  const loading = state.resolvedKey !== requestKey;

  return {
    role,
    user: state.user,
    loading,
    error: loading ? null : state.error,
    reload,
  };
}

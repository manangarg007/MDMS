import type { UserRole } from '../../../shared/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthSessionStub {
  role: UserRole;
  email: string;
}

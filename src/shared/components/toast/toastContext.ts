import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ShowToastOptions {
  type: ToastType;
  message: string;
  /** Auto-dismiss delay in milliseconds (defaults to 4000). */
  durationMs?: number;
}

export interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);


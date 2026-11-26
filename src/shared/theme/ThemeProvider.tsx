import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ThemeMode } from '../types';
import { ThemeContext, type ThemeContextValue } from './themeContext';

export const THEME_STORAGE_KEY = 'mdms_theme';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(storageKey: string): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const saved = window.localStorage.getItem(storageKey);
    return isThemeMode(saved) ? saved : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(storageKey: string, mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Ignore storage write errors (e.g. private browsing / quota exceeded)
  }
}

function resolveInitialTheme(storageKey: string, defaultTheme: ThemeMode): ThemeMode {
  const stored = readStoredTheme(storageKey);
  if (stored) {
    return stored;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : defaultTheme;
  }
  return defaultTheme;
}

function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    resolveInitialTheme(storageKey, defaultTheme),
  );

  useEffect(() => {
    applyThemeToDocument(theme);
    writeStoredTheme(storageKey, theme);
  }, [theme, storageKey]);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === storageKey && isThemeMode(event.newValue)) {
        setThemeState(event.newValue);
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

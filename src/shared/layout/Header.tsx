import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';
import { getAlertsPathForRole, ROLE_META } from '../routes';
import type { UserRole } from '../types';

export interface HeaderProps {
  role: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileMenu: () => void;
}

const LANGUAGES = ['EN', 'HI', 'KN'] as const;
type LanguageCode = (typeof LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'mdms_language';

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === 'EN' || value === 'HI' || value === 'KN';
}

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return 'EN';
  }
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(saved) ? saved : 'EN';
  } catch {
    return 'EN';
  }
}

export function Header({
  role,
  collapsed,
  onToggleCollapse,
  onOpenMobileMenu,
}: HeaderProps) {
  const [language, setLanguage] = useState<LanguageCode>(readStoredLanguage);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const meta = ROLE_META[role];
  const alertsPath = getAlertsPathForRole(role);
  const unreadCount = 3;

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage write errors
    }
  }, [language]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-4 backdrop-blur-xs sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          className="hidden rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            MDMS
          </span>
          <span className="hidden rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)] sm:inline-block">
            {meta.badgeText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={alertsPath}
          aria-label={`Notifications (${unreadCount} unread)`}
          title="View alerts & notifications"
          className="relative rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </Link>

        <ThemeToggle />

        <label className="sr-only" htmlFor="mdms-language-select">
          Select language
        </label>
        <select
          id="mdms-language-select"
          value={language}
          onChange={(event) => {
            const next = event.target.value;
            if (isLanguageCode(next)) {
              setLanguage(next);
            }
          }}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] outline-none transition hover:bg-[var(--bg-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          title="Language selector (UI preview)"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
              {meta.label.charAt(0)}
            </span>
            <span className="hidden md:inline">{meta.label}</span>
            <svg className="h-3.5 w-3.5 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {profileMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1.5 shadow-[var(--shadow-md)]"
            >
              <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {meta.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {meta.badgeText}
                </p>
              </div>
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setProfileMenuOpen(false)}
                className="mt-1 block rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                Profile and Settings
              </Link>
              <div className="my-1 border-t border-[var(--border-subtle)]" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Quick Role Switch
              </p>
              {(Object.keys(ROLE_META) as UserRole[]).map((roleKey) => {
                const isActiveRole = roleKey === role;
                return (
                  <Link
                    key={roleKey}
                    to={ROLE_META[roleKey].defaultPath}
                    role="menuitem"
                    aria-current={isActiveRole ? 'page' : undefined}
                    onClick={() => setProfileMenuOpen(false)}
                    className={`block rounded-lg px-3 py-1.5 text-xs transition ${
                      isActiveRole
                        ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-text)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {ROLE_META[roleKey].label}
                  </Link>
                );
              })}
              <div className="my-1 border-t border-[var(--border-subtle)]" />
              <Link
                to="/login"
                role="menuitem"
                onClick={() => setProfileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-xs font-medium text-[var(--status-danger-text)] transition hover:bg-[var(--status-danger-soft)]"
              >
                Logout
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

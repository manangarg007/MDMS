import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';
import { getAlertsPathForRole, ROLE_META } from '../routes';
import type { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileMenu: () => void;
}

const LANGUAGES = ['EN', 'HI', 'KN'] as const;
type LanguageCode = (typeof LANGUAGES)[number];

export function Header({
  role,
  collapsed,
  onToggleCollapse,
  onOpenMobileMenu,
}: HeaderProps) {
  const [language, setLanguage] = useState<LanguageCode>('EN');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const meta = ROLE_META[role];
  const alertsPath = getAlertsPathForRole(role);
  const unreadCount = 3;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            MDMS
          </span>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline-block">
            {meta.badgeText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={alertsPath}
          aria-label={`Notifications (${unreadCount} unread)`}
          title="View alerts & notifications"
          className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        </Link>

        <ThemeToggle />

        <label className="sr-only" htmlFor="mdms-language-select">
          Select language
        </label>
        <select
          id="mdms-language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
              {meta.label.charAt(0)}
            </span>
            <span className="hidden md:inline">{meta.label}</span>
            <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {profileMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {meta.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Phase 1 Demo Session
                </p>
              </div>
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setProfileMenuOpen(false)}
                className="mt-1 block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Profile and Settings
              </Link>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Role Switch
              </p>
              {(Object.keys(ROLE_META) as UserRole[]).map((roleKey) => (
                <Link
                  key={roleKey}
                  to={ROLE_META[roleKey].defaultPath}
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-1.5 text-xs ${
                    roleKey === role
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {ROLE_META[roleKey].label}
                </Link>
              ))}
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <Link
                to="/login"
                role="menuitem"
                onClick={() => setProfileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
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

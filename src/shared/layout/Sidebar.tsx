import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NavIcon } from '../components';
import { ROLE_MENU_CONFIG, ROLE_META } from '../routes';
import type { UserRole } from '../types';

export interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ role, collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const menuItems = ROLE_MENU_CONFIG[role];
  const meta = ROLE_META[role];

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseMobile();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
        aria-label="Primary sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <Link
            to={meta.defaultPath}
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-[var(--text-inverse)] shadow-[var(--shadow-sm)]">
              M
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                  MDMS
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {meta.label}
                </p>
              </div>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:hidden"
            aria-label="Close navigation menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Role navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path.endsWith('/dashboard')}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed ? (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[var(--accent)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <NavIcon name={item.icon} />
                  <span className={collapsed ? 'lg:hidden' : 'truncate'}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <Link
            to="/login"
            onClick={onCloseMobile}
            title={collapsed ? 'Switch Role (Login)' : undefined}
            className={`flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={collapsed ? 'lg:hidden' : 'truncate'}>Switch Role (Login)</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

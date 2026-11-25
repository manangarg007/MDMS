import { Link, NavLink } from 'react-router-dom';
import { NavIcon } from '../components';
import { ROLE_MENU_CONFIG, ROLE_META } from '../routes';
import type { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ role, collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const menuItems = ROLE_MENU_CONFIG[role];
  const meta = ROLE_META[role];

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
        aria-label="Primary sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link
            to={meta.defaultPath}
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              M
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  MDMS
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {meta.label}
                </p>
              </div>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`
              }
            >
              <NavIcon name={item.icon} />
              <span className={collapsed ? 'lg:hidden' : 'truncate'}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Link
            to="/login"
            onClick={onCloseMobile}
            title={collapsed ? 'Switch role / Login' : undefined}
            className={`flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={collapsed ? 'lg:hidden' : 'truncate'}>Switch Role (Login)</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

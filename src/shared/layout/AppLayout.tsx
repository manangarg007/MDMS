import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '../components';
import { getStoredRole, resolveRoleFromPath, setStoredRole } from '../routes';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const SIDEBAR_STORAGE_KEY = 'mdms_sidebar_collapsed';

function readSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // Ignore storage write errors in restricted environments
  }
}

export function AppLayout() {
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(readSidebarCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeRole = resolveRoleFromPath(pathname, getStoredRole());

  useEffect(() => {
    setStoredRole(activeRole);
  }, [activeRole]);

  useEffect(() => {
    writeSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Sidebar
        role={activeRole}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={handleCloseMobileMenu}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          role={activeRole}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobileMenu={handleOpenMobileMenu}
        />

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

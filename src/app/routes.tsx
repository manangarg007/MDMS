import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PageLoader } from '../shared/components';
import { AppLayout } from '../shared/layout';
import ServerErrorPage from '../shared/pages/ServerErrorPage';
import {
  AccessDeniedPage,
  EndUserAlertsPage,
  EndUserBillDetailsPage,
  EndUserBillsPage,
  EndUserDashboardPage,
  EndUserMeterDataPage,
  EnterpriseAlertsPage,
  EnterpriseAuditLogsPage,
  EnterpriseDashboardPage,
  EnterpriseMetersPage,
  EnterpriseReportsPage,
  EnterpriseSettingsPage,
  EnterpriseUsersPage,
  EnterpriseZoneDetailsPage,
  EnterpriseZonesPage,
  ForgotPasswordPage,
  LoginPage,
  MaintenancePage,
  NotFoundPage,
  ProfilePage,
  ResetPasswordPage,
  ZoneAlertsPage,
  ZoneDashboardPage,
  ZoneMeterDetailsPage,
  ZoneMetersPage,
  ZoneReportsPage,
  ZoneSettingsPage,
  ZoneUsersPage,
} from './lazyPages';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ServerErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'reset-password/:token',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MaintenancePage />
          </Suspense>
        ),
      },
      {
        path: 'access-denied',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AccessDeniedPage />
          </Suspense>
        ),
      },
      {
        element: <AppLayout />,
        errorElement: <ServerErrorPage />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'user',
            children: [
              { index: true, element: <Navigate to="/user/dashboard" replace /> },
              { path: 'dashboard', element: <EndUserDashboardPage /> },
              { path: 'bills', element: <EndUserBillsPage /> },
              { path: 'bills/:billId', element: <EndUserBillDetailsPage /> },
              { path: 'meter-data', element: <EndUserMeterDataPage /> },
              { path: 'alerts', element: <EndUserAlertsPage /> },
            ],
          },
          {
            path: 'zone',
            children: [
              { index: true, element: <Navigate to="/zone/dashboard" replace /> },
              { path: 'dashboard', element: <ZoneDashboardPage /> },
              { path: 'meters', element: <ZoneMetersPage /> },
              { path: 'meters/:meterId', element: <ZoneMeterDetailsPage /> },
              { path: 'users', element: <ZoneUsersPage /> },
              { path: 'reports', element: <ZoneReportsPage /> },
              { path: 'alerts', element: <ZoneAlertsPage /> },
              { path: 'settings', element: <ZoneSettingsPage /> },
            ],
          },
          {
            path: 'enterprise',
            children: [
              { index: true, element: <Navigate to="/enterprise/dashboard" replace /> },
              { path: 'dashboard', element: <EnterpriseDashboardPage /> },
              { path: 'zones', element: <EnterpriseZonesPage /> },
              { path: 'zones/:zoneId', element: <EnterpriseZoneDetailsPage /> },
              { path: 'meters', element: <EnterpriseMetersPage /> },
              { path: 'users', element: <EnterpriseUsersPage /> },
              { path: 'reports', element: <EnterpriseReportsPage /> },
              { path: 'alerts', element: <EnterpriseAlertsPage /> },
              { path: 'audit-logs', element: <EnterpriseAuditLogsPage /> },
              { path: 'settings', element: <EnterpriseSettingsPage /> },
            ],
          },
        ],
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);

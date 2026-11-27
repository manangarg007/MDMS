import { useState } from 'react';
import {
  EmptyState,
  PageHeader,
  Skeleton,
  Tabs,
  type TabItem,
} from '../../../shared/components';
import type { NotificationType } from '../../../shared/types';
import { useNotifications } from '../hooks/useNotifications';
import { formatDateTime } from '../utils/formatters';

type AlertTab = 'all' | 'unread';

const TYPE_ICON_STYLES: Record<NotificationType, string> = {
  bill_generated: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  payment_due: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  payment_received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  high_consumption: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  maintenance: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TYPE_ICON_STYLES[type]}`}
    >
      {type === 'bill_generated' ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 3h9l4 4v14H6z" strokeLinejoin="round" />
          <path d="M10 12h5M10 16h5" strokeLinecap="round" />
        </svg>
      ) : type === 'payment_due' ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : type === 'payment_received' ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : type === 'high_consumption' ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14.7 6.3a4 4 0 00-5.4 5.4l-5.3 5.3a1.5 1.5 0 002.1 2.1l5.3-5.3a4 4 0 005.4-5.4l-2.3 2.3-2.1-2.1 2.3-2.3z" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<AlertTab>('all');
  const unreadOnly = activeTab === 'unread';

  const { notifications, unreadCount, loading, error, reload } = useNotifications(unreadOnly);

  const tabs: TabItem[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: unreadCount },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Notifications"
        subtitle="Billing updates, payment reminders, high usage notices, and maintenance alerts."
        metadataBadge={
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            {unreadCount} unread
          </span>
        }
      />

      <Tabs
        id="end-user-alerts-tabs"
        tabs={tabs}
        activeTabId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as AlertTab)}
        ariaLabel="Filter notifications"
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title={unreadOnly ? 'No unread notifications' : 'No notifications'}
          description={
            unreadOnly
              ? 'You are all caught up on your alerts.'
              : 'Notifications for bills, payments, and maintenance will appear here.'
          }
          action={
            unreadOnly
              ? { label: 'View all notifications', onClick: () => setActiveTab('all') }
              : undefined
          }
        />
      ) : (
        <ul className="space-y-3" aria-label="Notifications list">
          {notifications.map((item) => {
            const isUnread = !item.read;
            return (
              <li
                key={item.id}
                className={`flex items-start gap-3.5 rounded-xl border p-4 transition ${
                  isUnread
                    ? 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-800/60 dark:bg-indigo-950/30'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <NotificationTypeIcon type={item.type} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400"
                          aria-label="Unread"
                        />
                      ) : null}
                      <h2
                        className={`text-sm ${
                          isUnread
                            ? 'font-bold text-slate-900 dark:text-slate-100'
                            : 'font-medium text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.title}
                      </h2>
                    </div>

                    <time
                      dateTime={item.createdAt}
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      {formatDateTime(item.createdAt)}
                    </time>
                  </div>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {item.message}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

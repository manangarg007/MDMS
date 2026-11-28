import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ConfirmDialog,
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  StatusBadge,
} from '../../../shared/components';
import type {
  DataTableFilter,
  DataTableServerConfig,
} from '../../../shared/components';
import { DEMO_ZONE_ID } from '../../../shared/config/demo';
import type { JsonServerTableQuery } from '../../../services/tableQuery';
import type {
  Meter,
  TableColumn,
  TableRowAction,
  User,
  UserStatus,
} from '../../../shared/types';
import {
  getZoneUserDetails,
  getZoneUsersPage,
  updateZoneUserStatus,
} from '../services';
import type { ZoneUserDetails, ZoneUsersQuery } from '../types';

type UserStatusFilter = UserStatus | '';

interface PendingStatusChange {
  user: User;
  nextStatus: UserStatus;
}

const ACTIVE_ZONE_STORAGE_KEY = 'mdms_active_zone_id';

const USER_STATUS_FILTER: DataTableFilter<User> = {
  key: 'status',
  accessorKey: 'status',
  label: 'Status',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'deactivated' },
  ],
};

const USER_COLUMNS: TableColumn<User>[] = [
  {
    key: 'id',
    accessorKey: 'id',
    header: 'Customer ID',
    sortable: true,
  },
  {
    key: 'name',
    accessorKey: 'name',
    header: 'Customer',
    sortable: true,
  },
  {
    key: 'email',
    accessorKey: 'email',
    header: 'Email',
    sortable: true,
  },
  {
    key: 'phone',
    accessorKey: 'phone',
    header: 'Phone',
    sortable: true,
    render: (user) => user.phone || '—',
  },
  {
    key: 'meterCount',
    header: 'Meters',
    sortable: true,
    align: 'right',
    sortValue: (user) => user.meterCount ?? user.assignedMeterIds?.length ?? 0,
    render: (user) => user.meterCount ?? user.assignedMeterIds?.length ?? 0,
  },
  {
    key: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortable: true,
    render: (user) => (
      <StatusBadge
        status={user.status === 'deactivated' ? 'inactive' : user.status}
      />
    ),
  },
];

function resolveActiveZoneId(searchParams: URLSearchParams): string {
  const fromQuery = searchParams.get('zoneId')?.trim();
  if (fromQuery) return fromQuery;

  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage
      .getItem(ACTIVE_ZONE_STORAGE_KEY)
      ?.trim();
    if (fromStorage) return fromStorage;
  }

  return DEMO_ZONE_ID;
}

function getStatusFilter(query: JsonServerTableQuery): UserStatusFilter {
  const value = query.filters?.status;
  return value === 'active' || value === 'deactivated' ? value : '';
}

function formatCreatedAt(value?: string): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function ZoneUsersPage() {
  const [searchParams] = useSearchParams();
  const zoneId = resolveActiveZoneId(searchParams);
  const [query, setQuery] = useState<JsonServerTableQuery>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
    search: '',
    filters: { zoneId, role: 'end-user' },
  });
  const [tableRevision, setTableRevision] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<ZoneUserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const controlledQuery = useMemo<JsonServerTableQuery>(
    () => ({
      ...query,
      filters: { ...query.filters, zoneId, role: 'end-user' },
    }),
    [query, zoneId],
  );

  const handleQueryChange = useCallback((nextQuery: JsonServerTableQuery) => {
    setQuery({
      ...nextQuery,
      filters: { ...nextQuery.filters, zoneId, role: 'end-user' },
    });
  }, [zoneId]);

  const loadUsersPage = useCallback((
    tableQuery: JsonServerTableQuery,
    signal: AbortSignal,
  ) => {
    const request: ZoneUsersQuery = {
      zoneId,
      role: 'end-user',
      page: tableQuery.page,
      limit: tableQuery.limit,
      sortBy: tableQuery.sortBy,
      sortOrder: tableQuery.sortOrder,
      search: tableQuery.search,
      status: getStatusFilter(tableQuery) || undefined,
    };
    return getZoneUsersPage(request, signal);
  }, [zoneId]);

  const serverConfig = useMemo<DataTableServerConfig<User>>(
    () => ({
      loadPage: loadUsersPage,
      query: controlledQuery,
      onQueryChange: handleQueryChange,
      refreshKey: tableRevision,
    }),
    [controlledQuery, handleQueryChange, loadUsersPage, tableRevision],
  );

  const openDetails = useCallback((user: User) => {
    setSelectedUser(user);
    setUserDetails(null);
    setDetailsError(null);
    setStatusError(null);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedUser(null);
    setUserDetails(null);
    setDetailsError(null);
  }, []);

  const rowActions = useMemo<TableRowAction<User>[]>(() => [
    {
      id: 'details',
      label: 'View details',
      onClick: openDetails,
    },
    {
      id: 'toggle-status',
      label: 'Change status',
      onClick: (user) => {
        setStatusError(null);
        setPendingStatusChange({
          user,
          nextStatus: user.status === 'active' ? 'deactivated' : 'active',
        });
      },
    },
  ], [openDetails]);

  const selectedUserId = selectedUser?.id;

  useEffect(() => {
    if (!selectedUserId) return undefined;
    const userId = selectedUserId;

    const controller = new AbortController();
    let cancelled = false;

    async function loadDetails() {
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const result = await getZoneUserDetails(userId, controller.signal);
        if (!cancelled) setUserDetails(result);
      } catch (error: unknown) {
        if (cancelled || controller.signal.aborted) return;
        setDetailsError(
          error instanceof Error ? error.message : 'Unable to load customer details.',
        );
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    }

    void loadDetails();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedUserId]);

  async function handleConfirmStatusChange() {
    if (!pendingStatusChange) return;
    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      const updatedUser = await updateZoneUserStatus(
        pendingStatusChange.user.id,
        pendingStatusChange.nextStatus,
      );
      setSelectedUser((current) => current?.id === updatedUser.id ? updatedUser : current);
      setUserDetails((current) => current?.user.id === updatedUser.id
        ? { ...current, user: updatedUser }
        : current);
      setPendingStatusChange(null);
      setTableRevision((revision) => revision + 1);
    } catch (error: unknown) {
      setStatusError(
        error instanceof Error ? error.message : 'Unable to update customer status.',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const pendingStatusLabel = pendingStatusChange?.nextStatus === 'active'
    ? 'activate'
    : 'deactivate';
  const meters: Meter[] = userDetails?.meters ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Zone User Management"
        subtitle={`Manage customers assigned to zone ${zoneId}.`}
      />

      {statusError && !pendingStatusChange ? (
        <p
          role="alert"
          className="rounded-lg border border-[var(--status-danger)] bg-[var(--status-danger-soft)] px-4 py-3 text-sm text-[var(--status-danger-text)]"
        >
          {statusError}
        </p>
      ) : null}

      <DataTable
        columns={USER_COLUMNS}
        filters={[USER_STATUS_FILTER]}
        getRowId={(user) => user.id}
        searchPlaceholder="Search customer ID, name, email, or phone..."
        initialPageSize={10}
        rowActions={rowActions}
        server={serverConfig}
      />

      <Modal
        isOpen={selectedUser !== null}
        onClose={closeDetails}
        title="Customer details"
        description={selectedUser ? `${selectedUser.name} · ${selectedUser.id}` : undefined}
        size="lg"
        footer={selectedUser ? (
          <>
            <button
              type="button"
              onClick={closeDetails}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusError(null);
                setPendingStatusChange({
                  user: selectedUser,
                  nextStatus: selectedUser.status === 'active' ? 'deactivated' : 'active',
                });
              }}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              {selectedUser.status === 'active' ? 'Deactivate customer' : 'Activate customer'}
            </button>
          </>
        ) : undefined}
      >
        {selectedUser ? (
          <div className="space-y-6">
            {detailsLoading ? (
              <p className="text-sm text-[var(--text-secondary)]" role="status">
                Loading customer details…
              </p>
            ) : null}

            {detailsError ? (
              <p
                role="alert"
                className="rounded-lg border border-[var(--status-danger)] bg-[var(--status-danger-soft)] px-4 py-3 text-sm text-[var(--status-danger-text)]"
              >
                {detailsError}
              </p>
            ) : null}

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Name</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">{selectedUser.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Customer ID</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{selectedUser.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Email</dt>
                <dd className="mt-1 break-all text-sm text-[var(--text-primary)]">{selectedUser.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Phone</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{selectedUser.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Zone</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{selectedUser.zoneName ?? selectedUser.zoneId ?? zoneId}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={selectedUser.status === 'deactivated' ? 'inactive' : selectedUser.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Customer since</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{formatCreatedAt(selectedUser.createdAt)}</dd>
              </div>
            </dl>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Assigned meters</h3>
                <span className="text-xs text-[var(--text-secondary)]">
                  {detailsLoading ? 'Loading…' : `${meters.length} ${meters.length === 1 ? 'meter' : 'meters'}`}
                </span>
              </div>
              {detailsLoading || detailsError ? null : meters.length === 0 ? (
                <EmptyState
                  title="No assigned meters"
                  description="This customer does not have any meters assigned in the current data."
                  className="min-h-36 border-0 bg-[var(--bg-subtle)]"
                />
              ) : (
                <ul className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)]">
                  {meters.map((meter) => (
                    <li key={meter.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{meter.meterNumber}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          {meter.tariffCategory} tariff · {meter.address || 'Address unavailable'}
                        </p>
                      </div>
                      <StatusBadge status={meter.status === 'deactivated' ? 'inactive' : meter.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        isOpen={pendingStatusChange !== null}
        onClose={() => {
          if (!isUpdatingStatus) {
            setPendingStatusChange(null);
            setStatusError(null);
          }
        }}
        onConfirm={() => void handleConfirmStatusChange()}
        title={`${pendingStatusLabel === 'activate' ? 'Activate' : 'Deactivate'} customer?`}
        message={pendingStatusChange
          ? statusError
            ? `${statusError} Try again to ${pendingStatusLabel} ${pendingStatusChange.user.name}.`
            : `Are you sure you want to ${pendingStatusLabel} ${pendingStatusChange.user.name}?`
          : ''}
        confirmLabel={pendingStatusLabel === 'activate' ? 'Activate' : 'Deactivate'}
        tone={pendingStatusLabel === 'deactivate' ? 'danger' : 'default'}
        isLoading={isUpdatingStatus}
      />
    </section>
  );
}

import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ConfirmDialog,
  DataTable,
  Modal,
  PageHeader,
  StatusBadge,
} from '../../../shared/components';
import type {
  DataTableFilter,
  DataTableServerConfig,
} from '../../../shared/components';
import { DEMO_ZONE_ID } from '../../../shared/config/demo';
import type {
  JsonServerTableQuery,
} from '../../../services/tableQuery';
import type {
  Meter,
  MeterStatus,
  TableColumn,
  TableRowAction,
  TariffCategory,
} from '../../../shared/types';
import {
  createMeter,
  deleteMeter,
  getZoneMetersPage,
  updateMeter,
  updateMeterStatus,
} from '../services';
import type { ZoneMetersQuery } from '../types';

type MeterStatusFilter = 'active' | 'inactive' | 'tampered' | 'maintenance';
type MeterActionKind = 'deactivate' | 'activate' | 'delete';

interface MeterFormValues {
  meterNumber: string;
  ownerId: string;
  ownerName: string;
  address: string;
  installedDate: string;
  tariffCategory: TariffCategory;
  status: MeterStatus;
  lastReading: string;
}

interface PendingMeterAction {
  meter: Meter;
  kind: MeterActionKind;
}

const ACTIVE_ZONE_STORAGE_KEY = 'mdms_active_zone_id';

const EMPTY_METER_FORM: MeterFormValues = {
  meterNumber: '',
  ownerId: '',
  ownerName: '',
  address: '',
  installedDate: '',
  tariffCategory: 'residential',
  status: 'active',
  lastReading: '0',
};

const STATUS_FILTER: DataTableFilter<Meter> = {
  key: 'status',
  accessorKey: 'status',
  label: 'Status',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Tampered', value: 'tampered' },
    { label: 'Maintenance', value: 'maintenance' },
  ],
};

const METER_COLUMNS: TableColumn<Meter>[] = [
  { key: 'meterNumber', accessorKey: 'meterNumber', header: 'Meter number', sortable: true },
  { key: 'ownerName', accessorKey: 'ownerName', header: 'Owner', sortable: true },
  { key: 'address', accessorKey: 'address', header: 'Address', sortable: true },
  {
    key: 'lastReading',
    accessorKey: 'lastReading',
    header: 'Last reading',
    sortable: true,
    align: 'right',
    render: (meter) => `${meter.lastReading.toLocaleString()} kWh`,
  },
  { key: 'installedDate', accessorKey: 'installedDate', header: 'Installed', sortable: true },
  {
    key: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortable: true,
    render: (meter) => (
      <StatusBadge
        status={meter.status === 'deactivated' ? 'inactive' : meter.status}
      />
    ),
  },
];

function resolveActiveZoneId(searchParams: URLSearchParams): string {
  const fromQuery = searchParams.get('zoneId')?.trim();
  if (fromQuery) return fromQuery;

  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage.getItem(ACTIVE_ZONE_STORAGE_KEY)?.trim();
    if (fromStorage) return fromStorage;
  }

  return DEMO_ZONE_ID;
}

function isMeterStatusFilter(value: string): value is MeterStatusFilter {
  return value === 'active'
    || value === 'inactive'
    || value === 'tampered'
    || value === 'maintenance';
}

function isTariffCategory(value: string): value is TariffCategory {
  return value === 'residential' || value === 'commercial' || value === 'industrial';
}

function getMeterStatusFilter(query: JsonServerTableQuery): MeterStatusFilter | undefined {
  const value = query.filters?.status;
  return typeof value === 'string' && isMeterStatusFilter(value) ? value : undefined;
}

function createFormValues(meter?: Meter): MeterFormValues {
  if (!meter) return { ...EMPTY_METER_FORM };
  return {
    meterNumber: meter.meterNumber,
    ownerId: meter.ownerId,
    ownerName: meter.ownerName ?? '',
    address: meter.address ?? '',
    installedDate: meter.installedDate,
    tariffCategory: meter.tariffCategory,
    status: meter.status,
    lastReading: String(meter.lastReading),
  };
}

export default function ZoneMetersPage() {
  const [searchParams] = useSearchParams();
  const zoneId = resolveActiveZoneId(searchParams);
  const [query, setQuery] = useState<JsonServerTableQuery>({
    page: 1,
    limit: 10,
    sortBy: 'meterNumber',
    sortOrder: 'asc',
    search: '',
    filters: { zoneId },
  });
  const [tableRevision, setTableRevision] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [formValues, setFormValues] = useState<MeterFormValues>(() => createFormValues());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingMeterAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const controlledQuery = useMemo<JsonServerTableQuery>(
    () => ({ ...query, filters: { ...query.filters, zoneId } }),
    [query, zoneId],
  );

  const handleQueryChange = useCallback((nextQuery: JsonServerTableQuery) => {
    setQuery({
      ...nextQuery,
      filters: { ...nextQuery.filters, zoneId },
    });
  }, [zoneId]);

  const loadMetersPage = useCallback((
    tableQuery: JsonServerTableQuery,
    signal: AbortSignal,
  ) => {
    const request: ZoneMetersQuery = {
      zoneId,
      page: tableQuery.page,
      limit: tableQuery.limit,
      sortBy: tableQuery.sortBy,
      sortOrder: tableQuery.sortOrder,
      search: tableQuery.search,
      status: getMeterStatusFilter(tableQuery),
    };
    return getZoneMetersPage(request, signal);
  }, [zoneId]);

  const serverConfig = useMemo<DataTableServerConfig<Meter>>(
    () => ({
      loadPage: loadMetersPage,
      query: controlledQuery,
      onQueryChange: handleQueryChange,
      refreshKey: tableRevision,
    }),
    [controlledQuery, handleQueryChange, loadMetersPage, tableRevision],
  );

  const openAddMeter = useCallback(() => {
    setEditingMeter(null);
    setFormValues(createFormValues());
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const openEditMeter = useCallback((meter: Meter) => {
    setEditingMeter(meter);
    setFormValues(createFormValues(meter));
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingMeter(null);
    setFormError(null);
  }, [isSaving]);

  const rowActions = useMemo<TableRowAction<Meter>[]>(() => [
    {
      id: 'edit',
      label: 'Edit meter',
      onClick: openEditMeter,
    },
    {
      id: 'deactivate',
      label: 'Deactivate meter',
      hidden: (meter) => meter.status === 'deactivated',
      onClick: (meter) => {
        setActionError(null);
        setPendingAction({ meter, kind: 'deactivate' });
      },
    },
    {
      id: 'activate',
      label: 'Activate meter',
      hidden: (meter) => meter.status !== 'deactivated',
      onClick: (meter) => {
        setActionError(null);
        setPendingAction({ meter, kind: 'activate' });
      },
    },
    {
      id: 'delete',
      label: 'Delete meter',
      variant: 'danger',
      onClick: (meter) => {
        setActionError(null);
        setPendingAction({ meter, kind: 'delete' });
      },
    },
  ], [openEditMeter]);

  async function handleSaveMeter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const meterNumber = formValues.meterNumber.trim();
    const ownerId = formValues.ownerId.trim();
    if (!meterNumber || !ownerId) {
      setFormError('Meter number and owner ID are required.');
      return;
    }

    const lastReading = Number(formValues.lastReading);
    if (!Number.isFinite(lastReading) || lastReading < 0) {
      setFormError('Last reading must be a non-negative number.');
      return;
    }

    const payload = {
      meterNumber,
      ownerId,
      ownerName: formValues.ownerName.trim() || undefined,
      zoneId,
      address: formValues.address.trim() || undefined,
      status: formValues.status,
      lastReading,
      installedDate: formValues.installedDate,
      tariffCategory: formValues.tariffCategory,
    };

    setIsSaving(true);
    try {
      if (editingMeter) {
        await updateMeter(editingMeter.id, payload);
      } else {
        await createMeter(payload);
        setQuery((current) => ({ ...current, page: 1 }));
      }
      setIsFormOpen(false);
      setEditingMeter(null);
      setTableRevision((revision) => revision + 1);
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Unable to save the meter.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      if (pendingAction.kind === 'delete') {
        await deleteMeter(pendingAction.meter.id);
      } else {
        const nextStatus: MeterStatus = pendingAction.kind === 'activate'
          ? 'active'
          : 'deactivated';
        await updateMeterStatus(pendingAction.meter.id, nextStatus);
      }
      setPendingAction(null);
      setTableRevision((revision) => revision + 1);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Unable to update the meter.');
    } finally {
      setIsActionLoading(false);
    }
  }

  const pendingActionTitle = pendingAction?.kind === 'delete'
    ? 'Delete meter?'
    : pendingAction?.kind === 'deactivate'
      ? 'Deactivate meter?'
      : 'Activate meter?';
  const pendingActionMessage = pendingAction?.kind === 'delete'
    ? `Delete ${pendingAction.meter.meterNumber}? This action cannot be undone.`
    : pendingAction?.kind === 'deactivate'
      ? `Deactivate ${pendingAction.meter.meterNumber}? It will no longer be treated as active.`
      : `Activate ${pendingAction?.meter.meterNumber ?? 'this meter'}?`;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Zone Meter Management"
        subtitle={`Manage meters assigned to ${zoneId}.`}
        actions={(
          <button
            type="button"
            onClick={openAddMeter}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <span aria-hidden="true">+</span>
            Add Meter
          </button>
        )}
      />

      {actionError ? (
        <p role="alert" className="rounded-lg border border-[var(--status-danger)] bg-[var(--status-danger-soft)] px-4 py-3 text-sm text-[var(--status-danger-text)]">
          {actionError}
        </p>
      ) : null}

      <DataTable
        columns={METER_COLUMNS}
        filters={[STATUS_FILTER]}
        getRowId={(meter) => meter.id}
        searchPlaceholder="Search meter number, owner, or address..."
        initialPageSize={10}
        rowActions={rowActions}
        server={serverConfig}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingMeter ? 'Edit meter' : 'Add meter'}
        description={`Meter will be assigned to zone ${zoneId}.`}
        size="lg"
        footer={(
          <>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSaving}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="zone-meter-form"
              disabled={isSaving}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : editingMeter ? 'Save changes' : 'Add meter'}
            </button>
          </>
        )}
      >
        <form id="zone-meter-form" onSubmit={(event) => void handleSaveMeter(event)} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Meter number
            <input
              required
              value={formValues.meterNumber}
              onChange={(event) => setFormValues((current) => ({ ...current, meterNumber: event.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Owner ID
            <input
              required
              value={formValues.ownerId}
              onChange={(event) => setFormValues((current) => ({ ...current, ownerId: event.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Owner name
            <input
              value={formValues.ownerName}
              onChange={(event) => setFormValues((current) => ({ ...current, ownerName: event.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Address
            <input
              value={formValues.address}
              onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Installed date
            <input
              required
              type="date"
              value={formValues.installedDate}
              onChange={(event) => setFormValues((current) => ({ ...current, installedDate: event.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Tariff category
            <select
              value={formValues.tariffCategory}
              onChange={(event) => {
                const tariffCategory = event.target.value;
                if (isTariffCategory(tariffCategory)) {
                  setFormValues((current) => ({ ...current, tariffCategory }));
                }
              }}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Status
            <select
              value={formValues.status}
              onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value as MeterStatus }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="active">Active</option>
              <option value="deactivated">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            Last reading (kWh)
            <input
              type="number"
              min="0"
              step="any"
              value={formValues.lastReading}
              onChange={(event) => setFormValues((current) => ({ ...current, lastReading: event.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
          {formError ? (
            <p role="alert" className="sm:col-span-2 text-sm text-[var(--status-danger-text)]">{formError}</p>
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onConfirm={() => void handleConfirmAction()}
        title={pendingActionTitle}
        message={pendingActionMessage}
        confirmLabel={pendingAction?.kind === 'delete' ? 'Delete meter' : pendingAction?.kind === 'deactivate' ? 'Deactivate' : 'Activate'}
        tone={pendingAction?.kind === 'activate' ? 'default' : 'danger'}
        isLoading={isActionLoading}
      />
    </section>
  );
}

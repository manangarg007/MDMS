import { useState } from 'react';
import type { Meter } from '../types';
import type { TableRowAction } from '../types';
import { DataTable } from './DataTable';
import type { DataTableFilter } from './DataTable';

type PreviewState = 'ready' | 'loading' | 'empty';

const sampleMeters: Meter[] = [
  { id: 'meter-1001', meterNumber: 'MDM-1001', ownerId: 'user-1', ownerName: 'Aarav Mehta', zoneId: 'zone-north', zoneName: 'North Zone', status: 'active', lastReading: 4821, installedDate: '2024-01-18', tariffCategory: 'residential' },
  { id: 'meter-1002', meterNumber: 'MDM-1002', ownerId: 'user-2', ownerName: 'Diya Shah', zoneId: 'zone-south', zoneName: 'South Zone', status: 'maintenance', lastReading: 935, installedDate: '2023-11-02', tariffCategory: 'commercial' },
  { id: 'meter-1003', meterNumber: 'MDM-1003', ownerId: 'user-3', ownerName: 'Kabir Rao', zoneId: 'zone-east', zoneName: 'East Zone', status: 'active', lastReading: 12840, installedDate: '2022-07-26', tariffCategory: 'industrial' },
  { id: 'meter-1004', meterNumber: 'MDM-1004', ownerId: 'user-4', ownerName: 'Mira Iyer', zoneId: 'zone-north', zoneName: 'North Zone', status: 'deactivated', lastReading: 2176, installedDate: '2021-05-09', tariffCategory: 'residential' },
  { id: 'meter-1005', meterNumber: 'MDM-1005', ownerId: 'user-5', ownerName: 'Arjun Nair', zoneId: 'zone-south', zoneName: 'South Zone', status: 'active', lastReading: 6310, installedDate: '2024-03-12', tariffCategory: 'commercial' },
  { id: 'meter-1006', meterNumber: 'MDM-1006', ownerId: 'user-6', ownerName: 'Anaya Das', zoneId: 'zone-east', zoneName: 'East Zone', status: 'maintenance', lastReading: 4042, installedDate: '2023-02-15', tariffCategory: 'residential' },
  { id: 'meter-1007', meterNumber: 'MDM-1007', ownerId: 'user-7', ownerName: 'Ishaan Sen', zoneId: 'zone-north', zoneName: 'North Zone', status: 'active', lastReading: 17550, installedDate: '2020-09-30', tariffCategory: 'industrial' },
  { id: 'meter-1008', meterNumber: 'MDM-1008', ownerId: 'user-8', ownerName: 'Sara Khan', zoneId: 'zone-south', zoneName: 'South Zone', status: 'active', lastReading: 2890, installedDate: '2022-12-01', tariffCategory: 'residential' },
];

const statusFilter: DataTableFilter<Meter> = {
  key: 'status',
  accessorKey: 'status',
  label: 'Status',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Deactivated', value: 'deactivated' },
    { label: 'Maintenance', value: 'maintenance' },
  ],
};

const zoneFilter: DataTableFilter<Meter> = {
  key: 'zone',
  accessorKey: 'zoneId',
  label: 'Zone',
  options: [
    { label: 'North Zone', value: 'zone-north' },
    { label: 'South Zone', value: 'zone-south' },
    { label: 'East Zone', value: 'zone-east' },
  ],
};

export function DataTableExample() {
  const [previewState, setPreviewState] = useState<PreviewState>('ready');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState('');

  const rowActions: TableRowAction<Meter>[] = [
    {
      id: 'view',
      label: 'View meter',
      onClick: (meter) => setActionMessage(`Viewing ${meter.meterNumber}`),
    },
    {
      id: 'maintenance',
      label: 'Mark for maintenance',
      disabled: (meter) => meter.status === 'maintenance',
      onClick: (meter) => setActionMessage(`${meter.meterNumber} marked for maintenance`),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Meter directory</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Sample records and controls to preview normal, loading, and empty table states.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Preview state
          <select
            value={previewState}
            onChange={(event) => setPreviewState(event.target.value as PreviewState)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="ready">Rows</option>
            <option value="loading">Loading</option>
            <option value="empty">Empty</option>
          </select>
        </label>
        <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-400">
          {selectedIds.length} row{selectedIds.length === 1 ? '' : 's'} selected
        </p>
        {actionMessage ? (
          <p role="status" className="text-sm text-blue-700 dark:text-blue-300">{actionMessage}</p>
        ) : null}
      </div>
      <DataTable
        data={previewState === 'empty' ? [] : sampleMeters}
        getRowId={(meter) => meter.id}
        searchPlaceholder="Search meter number or owner..."
        searchKeys={['meterNumber', 'ownerName']}
        loading={previewState === 'loading'}
        emptyTitle="No meters to display"
        emptyDescription="Try the Rows preview to return to the sample meter list."
        selection={{ selectedIds, onChange: setSelectedIds }}
        rowActions={rowActions}
        columns={[
          { key: 'meterNumber', accessorKey: 'meterNumber', header: 'Meter', sortable: true },
          { key: 'ownerName', accessorKey: 'ownerName', header: 'Owner', sortable: true },
          { key: 'lastReading', accessorKey: 'lastReading', header: 'Last reading', sortable: true, align: 'right' },
          { key: 'status', accessorKey: 'status', header: 'Status', sortable: true },
        ]}
        zoneColumn={{ key: 'zoneName', accessorKey: 'zoneName', header: 'Zone', sortable: true }}
        filters={[statusFilter]}
        zoneFilter={zoneFilter}
      />
    </div>
  );
}

import { PlaceholderPage } from '../../../shared/components';

export default function ZoneMetersPage() {
  return (
    <PlaceholderPage
      title="Zone Meter Management"
      description="Manage smart meters within the assigned zone (no zone column in single-zone view)."
      roleLabel="Zone Admin"
      routePath="/zone/meters"
      ownerHint="Member B"
      actions={[{ label: 'Preview Meter Details', to: '/zone/meters/M-124' }]}
      plannedItems={[
        'Shared Meter Table: meter ID, owner, status, last reading, row actions',
        'Search, status filter, and server-side pagination',
        'Add meter modal form with validation (Phase 1 validation-only)',
      ]}
    />
  );
}

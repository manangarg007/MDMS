import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseZonesPage() {
  return (
    <PlaceholderPage
      title="Zone Management"
      description="View and manage electricity distribution zones and their assigned admins."
      roleLabel="Enterprise"
      routePath="/enterprise/zones"
      ownerHint="Member C"
      actions={[{ label: 'Preview Zone Details', to: '/enterprise/zones/zone-1' }]}
      plannedItems={[
        'DataTable: zone ID, zone name, assigned admin, total meters, status, row actions',
        'Add zone modal form (name, admin, location, pincode, description)',
      ]}
    />
  );
}

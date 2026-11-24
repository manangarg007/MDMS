import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseMetersPage() {
  return (
    <PlaceholderPage
      title="Enterprise Meter Management"
      description="Cross-zone meter directory using the shared meter table with zone column and filter."
      roleLabel="Enterprise"
      routePath="/enterprise/meters"
      ownerHint="Member C"
      plannedItems={[
        'Shared meter table component with optional zone column and zone filter enabled',
        'Chart of consumption by zone',
      ]}
    />
  );
}

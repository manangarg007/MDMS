import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseDashboardPage() {
  return (
    <PlaceholderPage
      title="Enterprise Dashboard"
      description="Organization-wide summary across all zones, smart meters, and critical alerts."
      roleLabel="Enterprise"
      routePath="/enterprise/dashboard"
      ownerHint="Member C"
      actions={[
        { label: 'Zone Management', to: '/enterprise/zones' },
        { label: 'Alerts', to: '/enterprise/alerts' },
      ]}
      plannedItems={[
        'StatCards: total zones, total meters across all zones, critical alerts',
        'Bar chart: average consumption per zone',
        'Recent critical alerts list with link to /enterprise/alerts',
      ]}
    />
  );
}

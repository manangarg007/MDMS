import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseAlertsPage() {
  return (
    <PlaceholderPage
      title="Enterprise Alerts"
      description="Aggregated alerts across all zones with zone, severity, and status filters."
      roleLabel="Enterprise"
      routePath="/enterprise/alerts"
      ownerHint="Member C"
      plannedItems={[
        'Alerts DataTable across all zones with zone column and multi-criteria filters',
      ]}
    />
  );
}

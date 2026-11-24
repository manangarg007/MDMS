import { PlaceholderPage } from '../../../shared/components';

export default function ZoneAlertsPage() {
  return (
    <PlaceholderPage
      title="Zone Alerts"
      description="Operational alerts within this zone with severity and status filters."
      roleLabel="Zone Admin"
      routePath="/zone/alerts"
      ownerHint="Member B"
      plannedItems={[
        'DataTable of zone alerts with severity and status filters',
      ]}
    />
  );
}

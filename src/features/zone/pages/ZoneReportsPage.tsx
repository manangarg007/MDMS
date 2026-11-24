import { PlaceholderPage } from '../../../shared/components';

export default function ZoneReportsPage() {
  return (
    <PlaceholderPage
      title="Zone Reports & Analytics"
      description="Zone energy usage trends filtered by date range and meter."
      roleLabel="Zone Admin"
      routePath="/zone/reports"
      ownerHint="Member B"
      plannedItems={[
        'Line chart of energy usage over time with date range and meter filter',
        'Summary table and Generate report action button',
      ]}
    />
  );
}

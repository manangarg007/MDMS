import { PlaceholderPage } from '../../../shared/components';

export default function ZoneDashboardPage() {
  return (
    <PlaceholderPage
      title="Zone Dashboard"
      description="Zone-level operations overview for meters, average consumption, and pending alerts."
      roleLabel="Zone Admin"
      routePath="/zone/dashboard"
      ownerHint="Member B"
      actions={[
        { label: 'Meter Management', to: '/zone/meters' },
        { label: 'Reports & Analytics', to: '/zone/reports' },
      ]}
      plannedItems={[
        'Three StatCards: active meters, average usage, pending alerts',
        'Zone consumption ChartCard with Week and Month toggles',
        'Buttons: Add meter and Generate report',
      ]}
    />
  );
}

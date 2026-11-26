import { PlaceholderPage } from '../../../shared/components';

export default function Dashboard() {
  return (
    <PlaceholderPage
      title="End-user Dashboard"
      description="Customer overview with consumption summary, current bill, outstanding balance, and quick actions."
      roleLabel="End-user"
      routePath="/user/dashboard"
      ownerHint="Member A"
      actions={[
        { label: 'View Bills', to: '/user/bills' },
        { label: 'Detailed Usage', to: '/user/meter-data' },
        { label: 'Alerts', to: '/user/alerts' },
      ]}
      plannedItems={[
        'Welcome banner with user name, date, zone, last synced time, and meter number',
        'Four StatCards: current consumption, monthly bill, outstanding balance, last payment',
        'Consumption overview ChartCard with Day / Week / Month / Year toggle',
        'Quick action buttons navigating to Bills, Meter Data, and Alerts',
      ]}
    />
  );
}

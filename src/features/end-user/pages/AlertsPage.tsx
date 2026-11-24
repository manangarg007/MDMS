import { PlaceholderPage } from '../../../shared/components';

export default function AlertsPage() {
  return (
    <PlaceholderPage
      title="Alerts & Notifications"
      description="Customer notifications for bills, payments, high consumption, and maintenance."
      roleLabel="End-user"
      routePath="/user/alerts"
      ownerHint="Member A"
      plannedItems={[
        'Filter between All and Unread notifications',
        'Distinct visual highlight for unread items and EmptyState fallback',
      ]}
    />
  );
}

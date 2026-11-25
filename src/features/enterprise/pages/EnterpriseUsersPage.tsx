import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseUsersPage() {
  return (
    <PlaceholderPage
      title="User & Role Management"
      description="Organization-wide read-only directory of Admins and Consumers."
      roleLabel="Enterprise"
      routePath="/enterprise/users"
      ownerHint="Member C"
      plannedItems={[
        'Tabs for Admins and Consumers: ID, name, email, role, zone, status, row actions',
        'Donut chart of active vs deactivated users with year selector',
      ]}
    />
  );
}

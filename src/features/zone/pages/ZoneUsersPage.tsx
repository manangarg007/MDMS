import { PlaceholderPage } from '../../../shared/components';

export default function ZoneUsersPage() {
  return (
    <PlaceholderPage
      title="Zone User Management"
      description="Customer directory for this zone showing each customer and their assigned meters."
      roleLabel="Zone Admin"
      routePath="/zone/users"
      ownerHint="Member B"
      plannedItems={[
        'Customer table: ID, name, email, phone, number of meters, status, row actions',
        'Search and customer detail modal showing assigned meters',
      ]}
    />
  );
}

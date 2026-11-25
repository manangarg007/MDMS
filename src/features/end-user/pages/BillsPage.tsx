import { PlaceholderPage } from '../../../shared/components';

export default function BillsPage() {
  return (
    <PlaceholderPage
      title="Bills & Payments"
      description="Monthly billing history with status filtering and pagination."
      roleLabel="End-user"
      routePath="/user/bills"
      ownerHint="Member A"
      actions={[{ label: 'Preview Bill Details', to: '/user/bills/bill-1' }]}
      plannedItems={[
        'Heading "My bills" and note: "All bills are generated on the 1st of every month."',
        'Paginated DataTable: month, amount, due date, StatusBadge, and View/Pay action',
        'Server-side status filter (Pending, Paid, Overdue)',
      ]}
    />
  );
}

import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../../../shared/components';

export default function BillDetailsPage() {
  const { billId } = useParams();

  return (
    <PlaceholderPage
      title={`Bill Details (${billId ?? 'unknown'})`}
      description="Detailed monthly bill summary with daily meter readings and printable view."
      roleLabel="End-user"
      routePath="/user/bills/:billId"
      ownerHint="Member A"
      actions={[{ label: 'Back to Bills', to: '/user/bills' }]}
      plannedItems={[
        'Summary card: billing month, total amount, due date, status',
        'Daily breakdown table: date, reading, consumption, cost',
        'Buttons: Download PDF (inactive), Print (working), Pay now (inactive)',
      ]}
    />
  );
}

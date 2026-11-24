import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseZoneDetailsPage() {
  const { zoneId } = useParams();

  return (
    <PlaceholderPage
      title={`Zone Details (${zoneId ?? 'unknown'})`}
      description="Zone summary cards with tabs for its meters and customers."
      roleLabel="Enterprise"
      routePath="/enterprise/zones/:zoneId"
      ownerHint="Member C"
      actions={[{ label: 'Back to Zones', to: '/enterprise/zones' }]}
      plannedItems={[
        'Zone summary cards',
        'Tabs component switching between zone meters and zone users',
      ]}
    />
  );
}

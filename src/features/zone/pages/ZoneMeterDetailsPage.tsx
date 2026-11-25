import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../../../shared/components';

export default function ZoneMeterDetailsPage() {
  const { meterId } = useParams();

  return (
    <PlaceholderPage
      title={`Meter Details (${meterId ?? 'unknown'})`}
      description="Detailed meter profile, usage chart, and recent readings."
      roleLabel="Zone Admin"
      routePath="/zone/meters/:meterId"
      ownerHint="Member B"
      actions={[{ label: 'Back to Meters', to: '/zone/meters' }]}
      plannedItems={[
        'Meter metadata: ID, owner, address, status, installed date, tariff category, last reading',
        'Usage chart and recent readings table',
      ]}
    />
  );
}

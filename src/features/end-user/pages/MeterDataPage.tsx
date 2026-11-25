import { PlaceholderPage } from '../../../shared/components';

export default function MeterDataPage() {
  return (
    <PlaceholderPage
      title="Meter Data"
      description="Detailed electricity consumption analysis with period comparison."
      roleLabel="End-user"
      routePath="/user/meter-data"
      ownerHint="Member A"
      plannedItems={[
        'Date range and Day / Week / Month selector',
        'Two-line comparison chart (previous vs current) with legend',
        'Detailed readings table: date, reading, difference, notes',
      ]}
    />
  );
}

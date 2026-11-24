import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseReportsPage() {
  return (
    <PlaceholderPage
      title="Enterprise Reports & Analytics"
      description="Compare electricity consumption across zones with period filtering."
      roleLabel="Enterprise"
      routePath="/enterprise/reports"
      ownerHint="Member C"
      plannedItems={[
        'Grouped bar chart comparing consumption between zones with period filter',
      ]}
    />
  );
}

import { PlaceholderPage } from '../../../shared/components';

export default function EnterpriseSettingsPage() {
  return (
    <PlaceholderPage
      title="Settings & Configuration"
      description="Organization-wide policies, data retention, localisation, and notification defaults."
      roleLabel="Enterprise"
      routePath="/enterprise/settings"
      ownerHint="Member C"
      plannedItems={[
        'Data retention period, policies and rules (auto-logout timer, audit-log retention)',
        'Localisation (timezone, default language, currency e.g. INR) and notification defaults',
      ]}
    />
  );
}

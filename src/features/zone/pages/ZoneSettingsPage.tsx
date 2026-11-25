import { PlaceholderPage } from '../../../shared/components';

export default function ZoneSettingsPage() {
  return (
    <PlaceholderPage
      title="Zone Settings"
      description="Alert thresholds and notification channel toggles loaded from JSON Server."
      roleLabel="Zone Admin"
      routePath="/zone/settings"
      ownerHint="Member B"
      plannedItems={[
        'Threshold form: high consumption, low consumption, abnormal frequency, inactive meter duration',
        'Notification channel toggles',
      ]}
    />
  );
}

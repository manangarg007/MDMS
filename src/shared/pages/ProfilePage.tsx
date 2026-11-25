import { PlaceholderPage } from '../components';

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile & Settings"
      description="Shared Profile & Settings screen used across End-user, Zone Admin, and Enterprise roles."
      roleLabel="Shared"
      routePath="/profile"
      ownerHint="Member A"
      plannedItems={[
        'Profile tab: name, email, phone',
        'Security tab: current, new, and confirm password',
        'Notifications tab: email and SMS toggles',
      ]}
    />
  );
}

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FormField,
  Input,
  PageHeader,
  PasswordField,
  Skeleton,
  SkeletonText,
  Tabs,
  Toggle,
  useToast,
  type TabItem,
} from '../components';
import { ROLE_META } from '../routes';
import type { User } from '../types';
import {
  isEmail,
  isPhone,
  matches,
  minLength,
  passwordRules,
  required,
} from '../utils/validators';
import { useProfileUser } from './useProfileUser';

type ProfileTab = 'profile' | 'security' | 'notifications';

function parseTab(value: string | null): ProfileTab {
  if (value === 'security' || value === 'notifications') {
    return value;
  }
  return 'profile';
}

interface ProfileErrors {
  name?: string;
  email?: string;
  phone?: string;
}

function ProfileFormSection({ user }: { user: User }) {
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [errors, setErrors] = useState<ProfileErrors>({});

  const validateField = (field: keyof ProfileErrors, value: string): string | undefined => {
    if (field === 'name') return required(value, 'Name') ?? minLength(value, 2, 'Name');
    if (field === 'email') return required(value, 'Email') ?? isEmail(value);
    return required(value, 'Phone') ?? isPhone(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ProfileErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      phone: validateField('phone', phone),
    };
    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.phone) {
      return;
    }

    showToast({ type: 'success', message: 'Saved (demo only)' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <FormField id="profile-name" label="Full name" required error={errors.name}>
        <Input
          id="profile-name"
          value={name}
          error={errors.name}
          onChange={(e) => {
            const val = e.target.value;
            setName(val);
            if (errors.name) setErrors((p) => ({ ...p, name: validateField('name', val) }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, name: validateField('name', name) }))}
        />
      </FormField>

      <FormField id="profile-email" label="Email address" required error={errors.email}>
        <Input
          id="profile-email"
          type="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            if (errors.email) setErrors((p) => ({ ...p, email: validateField('email', val) }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, email: validateField('email', email) }))}
        />
      </FormField>

      <FormField
        id="profile-phone"
        label="Mobile number"
        hint="10-digit Indian mobile (e.g. +919845012345)"
        required
        error={errors.phone}
      >
        <Input
          id="profile-phone"
          type="tel"
          value={phone}
          error={errors.phone}
          onChange={(e) => {
            const val = e.target.value;
            setPhone(val);
            if (errors.phone) setErrors((p) => ({ ...p, phone: validateField('phone', val) }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, phone: validateField('phone', phone) }))}
        />
      </FormField>

      <div className="pt-2">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}

function SecurityFormSection() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentError, setCurrentError] = useState<string | undefined>();

  const rules = passwordRules(newPassword);
  const allRulesPassed = rules.every((rule) => rule.passed);
  const matchError =
    confirmPassword.length > 0
      ? matches(newPassword, confirmPassword, 'Passwords do not match.')
      : undefined;

  const canSubmit =
    currentPassword.trim().length > 0 &&
    allRulesPassed &&
    confirmPassword.length > 0 &&
    !matchError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const curErr = required(currentPassword, 'Current password');
    setCurrentError(curErr);

    if (curErr || !canSubmit) {
      return;
    }

    showToast({ type: 'success', message: 'Password updated (demo only)' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <FormField
        id="security-current"
        label="Current password"
        required
        error={currentError}
      >
        <PasswordField
          id="security-current"
          autoComplete="current-password"
          value={currentPassword}
          error={currentError}
          onChange={(e) => {
            const val = e.target.value;
            setCurrentPassword(val);
            if (currentError) setCurrentError(required(val, 'Current password'));
          }}
          onBlur={() => setCurrentError(required(currentPassword, 'Current password'))}
        />
      </FormField>

      <FormField id="security-new" label="New password" required>
        <PasswordField
          id="security-new"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </FormField>

      <ul
        aria-label="Password requirements"
        className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60"
      >
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center gap-2 ${
              rule.passed
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span aria-hidden="true">{rule.passed ? '✓' : '○'}</span>
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>

      <FormField
        id="security-confirm"
        label="Confirm new password"
        required
        error={matchError}
      >
        <PasswordField
          id="security-confirm"
          autoComplete="new-password"
          value={confirmPassword}
          error={matchError}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </FormField>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
        >
          Update password
        </button>
      </div>
    </form>
  );
}

function NotificationsFormSection() {
  const { showToast } = useToast();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleToggle = (channel: 'Email' | 'SMS', next: boolean) => {
    if (channel === 'Email') setEmailEnabled(next);
    else setSmsEnabled(next);

    showToast({
      type: 'info',
      message: `${channel} notifications ${next ? 'enabled' : 'disabled'} (demo only)`,
    });
  };

  return (
    <div className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Toggle
        checked={emailEnabled}
        onChange={(checked) => handleToggle('Email', checked)}
        label="Email notifications"
        description="Receive monthly bill statements, payment receipts, and maintenance updates."
      />

      <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
        <Toggle
          checked={smsEnabled}
          onChange={(checked) => handleToggle('SMS', checked)}
          label="SMS notifications"
          description="Receive urgent payment due reminders and high consumption alerts via SMS."
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));
  const { role, user, loading, error, reload } = useProfileUser();

  const tabs: TabItem[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Settings"
        subtitle={`Signed in as ${ROLE_META[role].label}${user ? ` (${user.id})` : ''}.`}
      />

      <Tabs
        id="profile-tabs"
        tabs={tabs}
        activeTabId={activeTab}
        onChange={handleTabChange}
        ariaLabel="Profile sections"
      />

      {activeTab === 'profile' ? (
        loading ? (
          <div className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <SkeletonText lines={3} />
          </div>
        ) : error || !user ? (
          <div
            role="alert"
            className="flex max-w-xl flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
          >
            <p>{error ?? 'Unable to load profile.'}</p>
            <button
              type="button"
              onClick={reload}
              className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <ProfileFormSection key={user.id} user={user} />
        )
      ) : activeTab === 'security' ? (
        <SecurityFormSection />
      ) : (
        <NotificationsFormSection />
      )}
    </div>
  );
}

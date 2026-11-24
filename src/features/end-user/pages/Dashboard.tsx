import { useEffect, useState } from 'react';
import { PlaceholderPage } from '../../../shared/components';
import { getDailyConsumption } from '../services/consumptionService';
import type { DailyData } from '../types/consumption';

export default function Dashboard() {
  const [data, setData] = useState<DailyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDailyConsumption()
      .then((res) => {
        if (active) {
          setData(res.data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError('JSON Server offline (run `npm run server` on port 3000 to preview live API data).');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PlaceholderPage
        title="End-user Dashboard"
        description="Customer overview with consumption summary, current bill, outstanding balance, and quick actions."
        roleLabel="End-user"
        routePath="/user/dashboard"
        ownerHint="Member A"
        actions={[
          { label: 'View Bills', to: '/user/bills' },
          { label: 'Detailed Usage', to: '/user/meter-data' },
          { label: 'Alerts', to: '/user/alerts' },
        ]}
        plannedItems={[
          'Welcome banner with user name, date, zone, last synced time, and meter number',
          'Four StatCards: current consumption, monthly bill, outstanding balance, last payment',
          'Consumption overview ChartCard with Day / Week / Month / Year toggle',
          'Quick action buttons navigating to Bills, Meter Data, and Alerts',
        ]}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          API Smoke Check (`/dailyData`)
        </h2>
        {error ? (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{error}</p>
        ) : data.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {data.map((item) => (
              <li key={item.id}>
                {item.date}: {item.units} units
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Checking API...</p>
        )}
      </div>
    </div>
  );
}

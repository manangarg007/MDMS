import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fixed seed so regenerating db.json always produces identical output
faker.seed(20261125);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../db.json');

const REFERENCE_DATE = '2026-11-25';
const MONTHS = [
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
];

const KARNATAKA_FIRST_NAMES = [
  'Aarav',
  'Aditi',
  'Akash',
  'Ananya',
  'Arjun',
  'Ashwini',
  'Bhavana',
  'Chetan',
  'Deepak',
  'Divya',
  'Ganesh',
  'Harish',
  'Kavya',
  'Kiran',
  'Lakshmi',
  'Manjunath',
  'Meghana',
  'Nandini',
  'Nikhil',
  'Pooja',
  'Prakash',
  'Prashanth',
  'Priya',
  'Raghavendra',
  'Rahul',
  'Rajesh',
  'Rakshith',
  'Ramesh',
  'Rashmi',
  'Rohit',
  'Sagar',
  'Sandhya',
  'Santosh',
  'Shashank',
  'Shreya',
  'Sneha',
  'Sowmya',
  'Srinivas',
  'Sudha',
  'Suresh',
  'Swathi',
  'Varun',
  'Vidya',
  'Vinay',
  'Vivek',
  'Yashwanth',
];

const KARNATAKA_LAST_NAMES = [
  'Acharya',
  'Alva',
  'Bhat',
  'D\'Souza',
  'Gowda',
  'Hegde',
  'Joshi',
  'Kamat',
  'Kulkarni',
  'Mayya',
  'Naik',
  'Nayak',
  'Pai',
  'Poojary',
  'Prabhu',
  'Rao',
  'Saldanha',
  'Shenoy',
  'Shetty',
  'Udupa',
  'Upadhyaya',
];

const ZONES_CONFIG = [
  {
    id: 'Z01',
    name: 'Mangalore',
    location: 'Mangalore, Dakshina Kannada',
    pincode: '575001',
    description: 'Central Mangalore urban residential and commercial feeder zone.',
    localities: ['Hampankatta', 'Kadri', 'Bejai', 'Kodialbail', 'Falnir', 'Attavar'],
  },
  {
    id: 'Z02',
    name: 'Udupi',
    location: 'Udupi, Udupi District',
    pincode: '576101',
    description: 'Udupi municipal and temple-town distribution zone.',
    localities: ['Manipal', 'Malpe', 'Kadiyali', 'Bannanje', 'Ambalpady', 'Kinnimulky'],
  },
  {
    id: 'Z03',
    name: 'Surathkal',
    location: 'Surathkal, Dakshina Kannada',
    pincode: '575014',
    description: 'Surathkal coastal, academic, and industrial corridor.',
    localities: ['Mukka', 'Katipalla', 'Krishnapura', 'Hosabettu', 'Iddya', 'Kana'],
  },
  {
    id: 'Z04',
    name: 'Mulki',
    location: 'Mulki, Dakshina Kannada',
    pincode: '574154',
    description: 'Mulki town and Shambhavi riverfront distribution zone.',
    localities: ['Karnad', 'Bappanadu', 'Chitrapu', 'Kilpady', 'Kolnad', 'Kinnigoli Road'],
  },
  {
    id: 'Z05',
    name: 'Bajpe',
    location: 'Bajpe, Dakshina Kannada',
    pincode: '574142',
    description: 'Bajpe airport and surrounding semi-urban feeder zone.',
    localities: ['Kenjar', 'Malavoor', 'Porkody', 'Permude', 'Kalavar', 'Jokatte'],
  },
  {
    id: 'Z06',
    name: 'Kotekar',
    location: 'Kotekar, Dakshina Kannada',
    pincode: '575022',
    description: 'Kotekar, Ullal, and Deralakatte southern coastal zone.',
    localities: ['Deralakatte', 'Beeri', 'Kumpala', 'Thokkottu', 'Someshwar', 'Ullal'],
  },
];

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function round2(val) {
  return Math.round(val * 100) / 100;
}

function daysInMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function nextMonthDueDate(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  return `${nextYear}-${pad(nextMonth, 2)}-12`;
}

function makeKarnatakaName() {
  const first = faker.helpers.arrayElement(KARNATAKA_FIRST_NAMES);
  const last = faker.helpers.arrayElement(KARNATAKA_LAST_NAMES);
  return `${first} ${last}`;
}

function makeEmail(name, id) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${slug}.${id.toLowerCase()}@mdms.in`;
}

function makeIndianPhone() {
  const prefix = faker.helpers.arrayElement(['9845', '9448', '9900', '9740', '9611', '8050', '7259']);
  const rest = faker.string.numeric(6);
  return `+91${prefix}${rest}`;
}

// ---------------------------------------------------------------------------
// 1. Users & Zones
// ---------------------------------------------------------------------------
const users = [];
const zones = [];

// Enterprise Admin
users.push({
  id: 'E01',
  name: 'Raghavendra Pai',
  email: 'raghavendra.pai.e01@mdms.in',
  phone: '+919845010001',
  role: 'enterprise',
  status: 'active',
});

// Zone Admins (ZA01..ZA06) & Zones (Z01..Z06)
ZONES_CONFIG.forEach((z, idx) => {
  const adminId = `ZA${pad(idx + 1, 2)}`;
  const adminName = makeKarnatakaName();

  users.push({
    id: adminId,
    name: adminName,
    email: makeEmail(adminName, adminId),
    phone: makeIndianPhone(),
    role: 'zone',
    zoneId: z.id,
    zoneName: z.name,
    status: 'active',
  });

  zones.push({
    id: z.id,
    name: z.name,
    location: z.location,
    pincode: z.pincode,
    description: z.description,
    adminId,
    adminName,
    totalMeters: 0, // updated after meters are generated
    status: 'active',
  });
});

// Customers: 14 per zone = 84 (U001..U084)
const CUSTOMERS_PER_ZONE = 14;
const customers = [];
let customerCounter = 1;

for (const zone of zones) {
  for (let i = 0; i < CUSTOMERS_PER_ZONE; i++) {
    const id = `U${pad(customerCounter, 3)}`;
    const isDemo = id === 'U001';
    const name = isDemo ? 'Ananya Shetty' : makeKarnatakaName();

    const user = {
      id,
      name,
      email: makeEmail(name, id),
      phone: makeIndianPhone(),
      role: 'end-user',
      zoneId: zone.id,
      zoneName: zone.name,
      meterCount: 0, // updated after meters are generated
      status: !isDemo && faker.number.float({ min: 0, max: 1 }) < 0.06 ? 'deactivated' : 'active',
    };

    users.push(user);
    customers.push(user);
    customerCounter++;
  }
}

// ---------------------------------------------------------------------------
// 2. Meters
// ---------------------------------------------------------------------------
const meters = [];
let meterCounter = 1;
const zoneById = new Map(zones.map((z) => [z.id, z]));
const zoneConfigById = new Map(ZONES_CONFIG.map((z) => [z.id, z]));

customers.forEach((customer, idx) => {
  // Never give U001 2 meters; roughly 1 in 5 other customers get 2 meters
  const numMeters = customer.id !== 'U001' && idx % 5 === 2 ? 2 : 1;
  const zCfg = zoneConfigById.get(customer.zoneId);
  const zone = zoneById.get(customer.zoneId);

  for (let m = 0; m < numMeters; m++) {
    const id = `M${pad(meterCounter, 3)}`;
    const isDemoMeter = id === 'M001';
    const locality = faker.helpers.arrayElement(zCfg.localities);
    const doorNo = faker.number.int({ min: 1, max: 420 });
    const cross = faker.number.int({ min: 1, max: 12 });

    const status = isDemoMeter
      ? 'active'
      : customer.status === 'deactivated'
        ? 'deactivated'
        : faker.helpers.weightedArrayElement([
            { weight: 85, value: 'active' },
            { weight: 10, value: 'maintenance' },
            { weight: 5, value: 'deactivated' },
          ]);

    const tariffCategory = isDemoMeter
      ? 'residential'
      : faker.helpers.weightedArrayElement([
          { weight: 75, value: 'residential' },
          { weight: 18, value: 'commercial' },
          { weight: 7, value: 'industrial' },
        ]);

    const installedYear = faker.number.int({ min: 2021, max: 2025 });
    const installedMonth = pad(faker.number.int({ min: 1, max: 12 }), 2);
    const installedDay = pad(faker.number.int({ min: 1, max: 28 }), 2);

    meters.push({
      id,
      meterNumber: `KA-${zone.id}-${pad(1000 + meterCounter, 4)}`,
      ownerId: customer.id,
      ownerName: customer.name,
      zoneId: zone.id,
      zoneName: zone.name,
      address: `#${doorNo}, ${cross}th Cross, ${locality}, ${zone.name} - ${zone.pincode}`,
      status,
      lastReading: 0, // updated from readings
      lastReadingAt: `${REFERENCE_DATE}T23:00:00.000Z`,
      installedDate: `${installedYear}-${installedMonth}-${installedDay}`,
      tariffCategory,
    });

    customer.meterCount += 1;
    zone.totalMeters += 1;
    meterCounter++;
  }
});

// ---------------------------------------------------------------------------
// 3. Readings (M001 full 12 months + 24h on 2026-11-25; others ~14 recent days)
// ---------------------------------------------------------------------------
const readings = [];
const metersByOwner = new Map();
for (const meter of meters) {
  if (!metersByOwner.has(meter.ownerId)) {
    metersByOwner.set(meter.ownerId, []);
  }
  metersByOwner.get(meter.ownerId).push(meter);
}

// Keep track of M001 daily rows by month so U001 billDays match M001 readings
const m001DailyByMonth = new Map();
let readingCounter = 1;

for (const meter of meters) {
  if (meter.id === 'M001') {
    let cumulative = 12450.0;

    for (const ym of MONTHS) {
      const totalDays = daysInMonth(ym);
      const lastDay = ym === '2026-11' ? 25 : totalDays;
      const monthRows = [];

      for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${ym}-${pad(d, 2)}`;

        if (dateStr === REFERENCE_DATE) {
          // Generate 24 hourly rows for 2026-11-25, summing to the day's consumption
          let dayConsumption = 0;
          for (let h = 0; h < 24; h++) {
            // Higher usage in morning (7-10) and evening (18-22)
            const isPeak = (h >= 7 && h <= 10) || (h >= 18 && h <= 22);
            const hourlyCons = round2(
              faker.number.float({
                min: isPeak ? 0.45 : 0.15,
                max: isPeak ? 0.95 : 0.42,
              }),
            );
            cumulative = round2(cumulative + hourlyCons);
            dayConsumption = round2(dayConsumption + hourlyCons);

            readings.push({
              id: `R${pad(readingCounter++, 5)}`,
              meterId: meter.id,
              timestamp: `${dateStr}T${pad(h, 2)}:00:00.000Z`,
              reading: cumulative,
              consumption: hourlyCons,
              notes: isPeak ? 'Peak hour interval' : undefined,
            });
          }

          const dailyRow = {
            id: `R${pad(readingCounter++, 5)}`,
            meterId: meter.id,
            timestamp: `${dateStr}T23:59:00.000Z`,
            reading: cumulative,
            consumption: dayConsumption,
            notes: 'Daily closing reading',
            date: dateStr,
          };
          readings.push({
            id: dailyRow.id,
            meterId: dailyRow.meterId,
            timestamp: dailyRow.timestamp,
            reading: dailyRow.reading,
            consumption: dailyRow.consumption,
            notes: dailyRow.notes,
          });
          monthRows.push(dailyRow);
        } else {
          const dailyCons = round2(faker.number.float({ min: 6.5, max: 11.5 }));
          cumulative = round2(cumulative + dailyCons);

          const dailyRow = {
            id: `R${pad(readingCounter++, 5)}`,
            meterId: meter.id,
            timestamp: `${dateStr}T23:59:00.000Z`,
            reading: cumulative,
            consumption: dailyCons,
            date: dateStr,
          };
          readings.push({
            id: dailyRow.id,
            meterId: dailyRow.meterId,
            timestamp: dailyRow.timestamp,
            reading: dailyRow.reading,
            consumption: dailyRow.consumption,
          });
          monthRows.push(dailyRow);
        }
      }

      m001DailyByMonth.set(ym, monthRows);
    }

    meter.lastReading = cumulative;
    meter.lastReadingAt = `${REFERENCE_DATE}T23:59:00.000Z`;
  } else {
    // ~14 recent daily rows: 2026-11-12 to 2026-11-25
    let cumulative = round2(faker.number.float({ min: 2500, max: 18000 }));
    for (let d = 12; d <= 25; d++) {
      const dateStr = `2026-11-${pad(d, 2)}`;
      const baseMin = meter.tariffCategory === 'industrial' ? 22 : meter.tariffCategory === 'commercial' ? 12 : 5;
      const baseMax = meter.tariffCategory === 'industrial' ? 48 : meter.tariffCategory === 'commercial' ? 26 : 12;
      const dailyCons = round2(faker.number.float({ min: baseMin, max: baseMax }));
      cumulative = round2(cumulative + dailyCons);

      readings.push({
        id: `R${pad(readingCounter++, 5)}`,
        meterId: meter.id,
        timestamp: `${dateStr}T23:59:00.000Z`,
        reading: cumulative,
        consumption: dailyCons,
      });
    }
    meter.lastReading = cumulative;
    meter.lastReadingAt = `${REFERENCE_DATE}T23:59:00.000Z`;
  }
}

// ---------------------------------------------------------------------------
// 4. Bills & BillDays
// ---------------------------------------------------------------------------
const bills = [];
const billDays = [];
let billCounter = 1;
let billDayCounter = 1;

const TARIFF_RATE = {
  residential: 5.5,
  commercial: 7.2,
  industrial: 8.0,
};

for (const customer of customers) {
  const customerMeters = metersByOwner.get(customer.id);
  const primaryMeter = customerMeters[0];
  const rate = TARIFF_RATE[primaryMeter.tariffCategory];

  MONTHS.forEach((ym, mIdx) => {
    const billId = `B${pad(billCounter++, 4)}`;
    const dueDate = nextMonthDueDate(ym);

    // Status distribution: 2026-11 is always pending; earlier months mostly paid, a few pending/overdue
    let status = 'paid';
    if (ym === '2026-11') {
      status = 'pending';
    } else if (ym === '2026-10') {
      const roll = faker.number.float({ min: 0, max: 1 });
      if (roll < 0.15) status = 'pending';
      else if (roll < 0.22) status = 'overdue';
    } else if (mIdx >= 8 && faker.number.float({ min: 0, max: 1 }) < 0.04) {
      status = 'overdue';
    }

    let paidDate;
    if (status === 'paid') {
      const [dueY, dueM] = dueDate.split('-').map(Number);
      const paidDay = pad(faker.number.int({ min: 2, max: 11 }), 2);
      paidDate = `${dueY}-${pad(dueM, 2)}-${paidDay}`;
    }

    let units;
    let amount;

    if (customer.id === 'U001') {
      const monthDailyRows = m001DailyByMonth.get(ym);
      let totalUnits = 0;
      let totalCost = 0;

      for (const row of monthDailyRows) {
        const cost = round2(row.consumption * rate);
        totalUnits = round2(totalUnits + row.consumption);
        totalCost += cost;

        billDays.push({
          id: `BD${pad(billDayCounter++, 4)}`,
          billId,
          date: row.date,
          reading: row.reading,
          consumption: row.consumption,
          cost,
        });
      }

      units = round2(totalUnits);
      amount = Math.round(totalCost);
    } else {
      const minUnits = primaryMeter.tariffCategory === 'industrial' ? 650 : primaryMeter.tariffCategory === 'commercial' ? 340 : 170;
      const maxUnits = primaryMeter.tariffCategory === 'industrial' ? 1250 : primaryMeter.tariffCategory === 'commercial' ? 680 : 320;
      units = round2(faker.number.float({ min: minUnits, max: maxUnits }));
      amount = Math.round(units * rate);
    }

    const billObj = {
      id: billId,
      userId: customer.id,
      meterId: primaryMeter.id,
      month: ym,
      units,
      amount,
      dueDate,
      status,
    };

    if (paidDate) {
      billObj.paidDate = paidDate;
    }

    bills.push(billObj);
  });
}

// ---------------------------------------------------------------------------
// 5. Consumption Series (day, week, month, year)
// ---------------------------------------------------------------------------
const consumptionSeries = [];
let seriesCounter = 1;

function makeSeriesPoints(range, scaleMultiplier) {
  if (range === 'day') {
    return Array.from({ length: 24 }, (_, h) => {
      const isPeak = (h >= 7 && h <= 10) || (h >= 18 && h <= 22);
      const base = isPeak ? 0.72 : 0.3;
      const value = round2(faker.number.float({ min: base * 0.75, max: base * 1.25 }) * scaleMultiplier);
      const previousValue = round2(value * faker.number.float({ min: 0.85, max: 1.15 }));
      return { label: `${pad(h, 2)}:00`, value, previousValue };
    });
  }
  if (range === 'week') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((label) => {
      const value = round2(faker.number.float({ min: 7.2, max: 11.4 }) * scaleMultiplier);
      const previousValue = round2(value * faker.number.float({ min: 0.88, max: 1.12 }));
      return { label, value, previousValue };
    });
  }
  if (range === 'month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    return weeks.map((label, idx) => {
      const factor = idx === 4 ? 0.55 : 1; // partial 5th week
      const value = round2(faker.number.float({ min: 52, max: 76 }) * factor * scaleMultiplier);
      const previousValue = round2(value * faker.number.float({ min: 0.88, max: 1.14 }));
      return { label, value, previousValue };
    });
  }
  // year
  const monthLabels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  return monthLabels.map((label) => {
    const value = round2(faker.number.float({ min: 210, max: 310 }) * scaleMultiplier);
    const previousValue = round2(value * faker.number.float({ min: 0.85, max: 1.15 }));
    return { label, value, previousValue };
  });
}

const RANGES = ['day', 'week', 'month', 'year'];

// User scope: U001 + 3 other customers
for (const uid of ['U001', 'U002', 'U003', 'U004']) {
  for (const range of RANGES) {
    consumptionSeries.push({
      id: `CS${pad(seriesCounter++, 3)}`,
      scope: 'user',
      scopeId: uid,
      range,
      points: makeSeriesPoints(range, 1),
    });
  }
}

// Zone scope: Z01..Z06
for (const zone of zones) {
  for (const range of RANGES) {
    consumptionSeries.push({
      id: `CS${pad(seriesCounter++, 3)}`,
      scope: 'zone',
      scopeId: zone.id,
      range,
      points: makeSeriesPoints(range, zone.totalMeters),
    });
  }
}

// Enterprise scope: all
const totalAllMeters = meters.length;
for (const range of RANGES) {
  consumptionSeries.push({
    id: `CS${pad(seriesCounter++, 3)}`,
    scope: 'enterprise',
    scopeId: 'all',
    range,
    points: makeSeriesPoints(range, totalAllMeters),
  });
}

// ---------------------------------------------------------------------------
// 6. Alerts (at least 20 across zones)
// ---------------------------------------------------------------------------
const ALERT_TEMPLATES = [
  { severity: 'critical', title: 'Voltage Surge Detected', message: 'Phase voltage exceeded 260V threshold on feeder line.' },
  { severity: 'critical', title: 'Meter Tamper Alert', message: 'Magnetic interference or enclosure open event reported.' },
  { severity: 'critical', title: 'Communication Outage', message: 'No telemetry heartbeat received for over 24 hours.' },
  { severity: 'warning', title: 'High Consumption Spike', message: 'Hourly consumption exceeded 2.5x rolling 7-day average.' },
  { severity: 'warning', title: 'Low Power Factor', message: 'Power factor dropped below 0.85 during peak evening hours.' },
  { severity: 'info', title: 'Scheduled Firmware Update', message: 'Meter firmware queued for nightly OTA update window.' },
  { severity: 'info', title: 'Meter Restored Online', message: 'Telemetry link re-established after brief maintenance.' },
];

const alerts = [];
const metersByZone = new Map();
for (const meter of meters) {
  if (!metersByZone.has(meter.zoneId)) {
    metersByZone.set(meter.zoneId, []);
  }
  metersByZone.get(meter.zoneId).push(meter);
}

let alertCounter = 1;
for (let i = 0; i < 24; i++) {
  const zone = zones[i % zones.length];
  const zoneMeters = metersByZone.get(zone.id);
  const meter = faker.helpers.arrayElement(zoneMeters);
  const template = ALERT_TEMPLATES[i % ALERT_TEMPLATES.length];
  const status = i < 10 ? 'pending' : i < 17 ? 'acknowledged' : 'resolved';
  const day = pad(faker.number.int({ min: 10, max: 25 }), 2);
  const hour = pad(faker.number.int({ min: 0, max: 23 }), 2);

  alerts.push({
    id: `A${pad(alertCounter++, 3)}`,
    zoneId: zone.id,
    zoneName: zone.name,
    meterId: meter.id,
    title: template.title,
    message: `${template.message} (Meter ${meter.meterNumber})`,
    severity: template.severity,
    status,
    createdAt: `2026-11-${day}T${hour}:15:00.000Z`,
  });
}

// ---------------------------------------------------------------------------
// 7. Notifications (at least 15 for U001, mix of all 5 types, ~1/3 unread)
// ---------------------------------------------------------------------------
const U001_NOTIFICATIONS = [
  { type: 'bill_generated', title: 'November 2026 Bill Ready', message: 'Your electricity bill for November 2026 has been generated.', read: false, date: '2026-11-25T09:00:00.000Z' },
  { type: 'payment_due', title: 'Payment Due Reminder', message: 'Your November 2026 bill is due on 12 Dec 2026.', read: false, date: '2026-11-24T10:30:00.000Z' },
  { type: 'high_consumption', title: 'Evening Peak Usage Notice', message: 'Usage between 7 PM and 9 PM was 24% higher than usual.', read: false, date: '2026-11-23T21:15:00.000Z' },
  { type: 'maintenance', title: 'Scheduled Feeder Maintenance', message: 'Mangalore Z01 feeder check scheduled for Sunday 6:00 AM - 7:30 AM.', read: false, date: '2026-11-22T08:00:00.000Z' },
  { type: 'payment_received', title: 'Payment Confirmed', message: 'Thank you! Payment for your October 2026 bill has been received.', read: false, date: '2026-11-08T14:20:00.000Z' },
  { type: 'high_consumption', title: 'Weekly Usage Summary', message: 'Your weekly consumption reached 64.2 kWh.', read: false, date: '2026-11-18T09:00:00.000Z' },
  { type: 'bill_generated', title: 'October 2026 Bill Ready', message: 'Your electricity bill for October 2026 has been generated.', read: true, date: '2026-11-01T09:00:00.000Z' },
  { type: 'payment_received', title: 'Payment Confirmed', message: 'Payment for September 2026 bill was processed successfully.', read: true, date: '2026-10-07T11:10:00.000Z' },
  { type: 'bill_generated', title: 'September 2026 Bill Ready', message: 'Your electricity bill for September 2026 has been generated.', read: true, date: '2026-10-01T09:00:00.000Z' },
  { type: 'maintenance', title: 'Smart Meter Firmware Updated', message: 'Meter M001 firmware was updated automatically overnight.', read: true, date: '2026-09-20T04:30:00.000Z' },
  { type: 'payment_received', title: 'Payment Confirmed', message: 'Payment for August 2026 bill was processed successfully.', read: true, date: '2026-09-09T16:45:00.000Z' },
  { type: 'bill_generated', title: 'August 2026 Bill Ready', message: 'Your electricity bill for August 2026 has been generated.', read: true, date: '2026-09-01T09:00:00.000Z' },
  { type: 'payment_due', title: 'Payment Due Reminder', message: 'Reminder: August 2026 bill due by 12 Sep 2026.', read: true, date: '2026-09-05T10:00:00.000Z' },
  { type: 'high_consumption', title: 'High Usage Alert', message: 'Daily consumption crossed 11 kWh on 14 Aug 2026.', read: true, date: '2026-08-15T08:30:00.000Z' },
  { type: 'payment_received', title: 'Payment Confirmed', message: 'Payment for July 2026 bill was processed successfully.', read: true, date: '2026-08-06T12:00:00.000Z' },
  { type: 'bill_generated', title: 'July 2026 Bill Ready', message: 'Your electricity bill for July 2026 has been generated.', read: true, date: '2026-08-01T09:00:00.000Z' },
  { type: 'maintenance', title: 'Zone Inspection Completed', message: 'Routine transformer inspection in Mangalore completed.', read: true, date: '2026-07-19T17:00:00.000Z' },
  { type: 'payment_received', title: 'Payment Confirmed', message: 'Payment for June 2026 bill was processed successfully.', read: true, date: '2026-07-08T15:10:00.000Z' },
];

const notifications = [];
let notifCounter = 1;

for (const item of U001_NOTIFICATIONS) {
  notifications.push({
    id: `N${pad(notifCounter++, 3)}`,
    userId: 'U001',
    type: item.type,
    title: item.title,
    message: item.message,
    createdAt: item.date,
    read: item.read,
  });
}

// Add a few notifications for other customers (U002..U007)
const OTHER_TYPES = ['bill_generated', 'payment_due', 'payment_received', 'high_consumption', 'maintenance'];
for (let i = 2; i <= 7; i++) {
  const uid = `U${pad(i, 3)}`;
  const type = OTHER_TYPES[i % OTHER_TYPES.length];
  notifications.push({
    id: `N${pad(notifCounter++, 3)}`,
    userId: uid,
    type,
    title: 'Account Notification',
    message: `Automated ${type.replace('_', ' ')} update for customer ${uid}.`,
    createdAt: `2026-11-${pad(18 + (i % 7), 2)}T10:00:00.000Z`,
    read: i % 2 === 0,
  });
}

// ---------------------------------------------------------------------------
// 8. Audit Logs (at least 30)
// ---------------------------------------------------------------------------
const AUDIT_ACTIONS = [
  { action: 'Created zone', resource: () => `Zone ${faker.helpers.arrayElement(zones).id}` },
  { action: 'Updated zone settings', resource: () => `Settings zone-${faker.helpers.arrayElement(zones).id}` },
  { action: 'Deactivated meter', resource: () => `Meter ${faker.helpers.arrayElement(meters).id}` },
  { action: 'Activated meter', resource: () => `Meter ${faker.helpers.arrayElement(meters).id}` },
  { action: 'Acknowledged alert', resource: () => `Alert ${faker.helpers.arrayElement(alerts).id}` },
  { action: 'Resolved alert', resource: () => `Alert ${faker.helpers.arrayElement(alerts).id}` },
  { action: 'Generated monthly bills', resource: () => `Bills 2026-11` },
  { action: 'Updated enterprise settings', resource: () => `Settings enterprise` },
  { action: 'Exported audit report', resource: () => `Zone ${faker.helpers.arrayElement(zones).id}` },
];

const adminUsers = users.filter((u) => u.role === 'enterprise' || u.role === 'zone');
const auditLogs = [];

for (let i = 1; i <= 36; i++) {
  const actor = faker.helpers.arrayElement(adminUsers);
  const template = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];
  const day = pad(faker.number.int({ min: 1, max: 25 }), 2);
  const hour = pad(faker.number.int({ min: 8, max: 20 }), 2);
  const minute = pad(faker.number.int({ min: 0, max: 59 }), 2);

  auditLogs.push({
    id: `L${pad(i, 3)}`,
    timestamp: `2026-11-${day}T${hour}:${minute}:00.000Z`,
    userId: actor.id,
    userName: actor.name,
    action: template.action,
    resource: template.resource(),
    status: i % 11 === 0 ? 'failed' : 'success',
  });
}

// ---------------------------------------------------------------------------
// 9. Settings (zone settings + enterprise settings)
// ---------------------------------------------------------------------------
const settings = [
  ...zones.map((zone) => ({
    id: `zone-${zone.id}`,
    zoneId: zone.id,
    highConsumptionThreshold: 25,
    lowConsumptionThreshold: 1,
    abnormalFrequencyMinutes: 15,
    inactiveMeterHours: 24,
    emailNotifications: true,
    smsNotifications: zone.id === 'Z01' || zone.id === 'Z02',
  })),
  {
    id: 'enterprise',
    dataRetentionDays: 365,
    autoLogoutMinutes: 30,
    auditLogRetentionDays: 730,
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'en',
    currency: 'INR',
    defaultEmailNotifications: true,
    defaultSmsNotifications: false,
  },
];

// ---------------------------------------------------------------------------
// 10. Validation
// ---------------------------------------------------------------------------
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Validation failed: ${message}`);
  }
}

function validateDatabase() {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const zoneMap = new Map(zones.map((z) => [z.id, z]));
  const meterMap = new Map(meters.map((m) => [m.id, m]));

  // Zones & Admins
  assert(zones.length === 6, `Expected 6 zones, got ${zones.length}`);
  for (const z of zones) {
    const admin = userMap.get(z.adminId);
    assert(admin && admin.role === 'zone' && admin.zoneId === z.id, `Zone ${z.id} has invalid adminId ${z.adminId}`);
  }

  // Users
  const endUsers = users.filter((u) => u.role === 'end-user');
  assert(endUsers.length === 84, `Expected 84 end-users, got ${endUsers.length}`);
  assert(userMap.get('U001')?.zoneId === 'Z01', 'U001 must belong to Z01');
  assert(userMap.get('U001')?.meterCount === 1, 'U001 must own exactly 1 meter');

  // Meters
  const meterIds = new Set();
  const ownerCounts = new Map();
  const zoneCounts = new Map();
  for (const m of meters) {
    assert(!meterIds.has(m.id), `Duplicate meter id ${m.id}`);
    meterIds.add(m.id);

    const owner = userMap.get(m.ownerId);
    const zone = zoneMap.get(m.zoneId);
    assert(owner && owner.role === 'end-user', `Meter ${m.id} has invalid ownerId ${m.ownerId}`);
    assert(zone, `Meter ${m.id} has invalid zoneId ${m.zoneId}`);
    assert(owner.zoneId === m.zoneId, `Meter ${m.id} zone (${m.zoneId}) !== owner zone (${owner.zoneId})`);

    ownerCounts.set(m.ownerId, (ownerCounts.get(m.ownerId) ?? 0) + 1);
    zoneCounts.set(m.zoneId, (zoneCounts.get(m.zoneId) ?? 0) + 1);
  }

  for (const u of endUsers) {
    assert(u.meterCount === (ownerCounts.get(u.id) ?? 0), `User ${u.id} meterCount mismatch`);
  }
  for (const z of zones) {
    assert(z.totalMeters === (zoneCounts.get(z.id) ?? 0), `Zone ${z.id} totalMeters mismatch`);
  }

  // Bills & BillDays
  assert(bills.length === endUsers.length * 12, `Expected ${endUsers.length * 12} bills, got ${bills.length}`);
  const billDaysByBillId = new Map();
  for (const bd of billDays) {
    if (!billDaysByBillId.has(bd.billId)) billDaysByBillId.set(bd.billId, []);
    billDaysByBillId.get(bd.billId).push(bd);
  }

  for (const b of bills) {
    assert(b.dueDate.endsWith('-12'), `Bill ${b.id} dueDate ${b.dueDate} is not 12th of month`);
    if (b.month === '2026-11') {
      assert(b.status === 'pending', `Bill ${b.id} for 2026-11 must be pending`);
    }
    if (b.status === 'paid') {
      assert(Boolean(b.paidDate), `Paid bill ${b.id} must have paidDate`);
    } else {
      assert(b.paidDate === undefined, `Unpaid bill ${b.id} must not have paidDate`);
    }

    if (b.userId === 'U001') {
      const days = billDaysByBillId.get(b.id) ?? [];
      const expectedDays = b.month === '2026-11' ? 25 : daysInMonth(b.month);
      assert(days.length === expectedDays, `U001 bill ${b.id} (${b.month}) expected ${expectedDays} billDays, got ${days.length}`);
      const sumCost = days.reduce((acc, d) => acc + d.cost, 0);
      const sumUnits = days.reduce((acc, d) => acc + d.consumption, 0);
      assert(b.amount === Math.round(sumCost), `U001 bill ${b.id} amount ${b.amount} !== rounded sum ${Math.round(sumCost)}`);
      assert(Math.abs(b.units - sumUnits) < 0.05, `U001 bill ${b.id} units ${b.units} !== sum ${sumUnits}`);
    }
  }

  // Readings for M001
  const m001Readings = readings.filter((r) => r.meterId === 'M001');
  const m001Hourly = m001Readings.filter((r) => r.timestamp.startsWith(REFERENCE_DATE) && !r.timestamp.endsWith('23:59:00.000Z'));
  const m001Daily = m001Readings.filter((r) => r.timestamp.endsWith('23:59:00.000Z'));
  assert(m001Hourly.length === 24, `Expected 24 hourly readings for M001 on ${REFERENCE_DATE}, got ${m001Hourly.length}`);
  assert(m001Daily.length >= 355, `Expected ~12 months of daily readings for M001, got ${m001Daily.length}`);

  for (let i = 1; i < m001Daily.length; i++) {
    assert(m001Daily[i].reading > m001Daily[i - 1].reading, `M001 daily reading not strictly increasing at index ${i}`);
  }
  for (let i = 1; i < m001Hourly.length; i++) {
    assert(m001Hourly[i].reading > m001Hourly[i - 1].reading, `M001 hourly reading not strictly increasing at index ${i}`);
  }

  // Consumption series
  assert(consumptionSeries.length >= 44, `Expected at least 44 consumptionSeries docs, got ${consumptionSeries.length}`);
  for (const s of consumptionSeries) {
    for (const p of s.points) {
      assert(typeof p.previousValue === 'number', `Series ${s.id} point missing previousValue`);
    }
  }

  // Alerts, Notifications, AuditLogs, Settings
  assert(alerts.length >= 20, `Expected >= 20 alerts, got ${alerts.length}`);
  for (const a of alerts) {
    const m = meterMap.get(a.meterId);
    assert(m && m.zoneId === a.zoneId, `Alert ${a.id} meterId ${a.meterId} not in zone ${a.zoneId}`);
  }

  const u001Notifs = notifications.filter((n) => n.userId === 'U001');
  assert(u001Notifs.length >= 15, `Expected >= 15 notifications for U001, got ${u001Notifs.length}`);
  const u001NotifTypes = new Set(u001Notifs.map((n) => n.type));
  assert(u001NotifTypes.size === 5, `Expected all 5 notification types for U001, got ${u001NotifTypes.size}`);

  assert(auditLogs.length >= 30, `Expected >= 30 auditLogs, got ${auditLogs.length}`);
  assert(settings.length === 7, `Expected 7 settings docs (6 zones + 1 enterprise), got ${settings.length}`);
}

validateDatabase();

const db = {
  zones,
  users,
  meters,
  bills,
  billDays,
  readings,
  consumptionSeries,
  alerts,
  notifications,
  auditLogs,
  settings,
};

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n', 'utf8');

console.log('✅ Generated and validated db.json successfully!\n');
console.table(
  Object.entries(db).map(([collection, rows]) => ({
    collection,
    count: rows.length,
  })),
);

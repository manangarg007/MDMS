import type { ListQueryParams } from './common';

export type MeterStatus = 'active' | 'deactivated' | 'maintenance';

export type TariffCategory = 'residential' | 'commercial' | 'industrial';

/**
 * Smart meter domain entity.
 * Domain rules: every meter belongs to exactly one owner (`ownerId`) and one zone (`zoneId`).
 */
export interface Meter {
  id: string;
  meterNumber: string;
  ownerId: string;
  ownerName?: string;
  zoneId: string;
  zoneName?: string;
  address?: string;
  status: MeterStatus;
  lastReading: number;
  lastReadingAt?: string;
  installedDate: string;
  tariffCategory: TariffCategory;
}

export interface MeterReading {
  id: string;
  meterId: string;
  timestamp: string;
  reading: number;
  consumption: number;
  notes?: string;
}

export interface MeterQueryParams extends ListQueryParams {
  zoneId?: string;
  ownerId?: string;
  status?: MeterStatus;
  tariffCategory?: TariffCategory;
}

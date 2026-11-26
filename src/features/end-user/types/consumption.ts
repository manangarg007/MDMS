import type { ChartSeriesPoint, TimeRange } from '../../../shared/types';

export type ConsumptionScope = 'user' | 'zone' | 'enterprise';

export interface ConsumptionSeries {
  id: string;
  scope: ConsumptionScope;
  scopeId: string;
  range: TimeRange;
  points: ChartSeriesPoint[];
}

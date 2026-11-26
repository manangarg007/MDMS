import http from '../../../services/http';
import type { TimeRange } from '../../../shared/types';
import type { ConsumptionScope, ConsumptionSeries } from '../types/consumption';

export async function getConsumptionSeries(
  scope: ConsumptionScope,
  scopeId: string,
  range: TimeRange,
): Promise<ConsumptionSeries> {
  const response = await http.get<ConsumptionSeries[]>('/consumptionSeries', {
    params: { scope, scopeId, range },
  });
  const series = response.data[0];

  if (!series) {
    throw new Error(`No consumption series found for ${scope} ${scopeId} (${range}).`);
  }

  return series;
}

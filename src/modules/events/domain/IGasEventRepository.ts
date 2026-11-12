import { GasEvent } from './GasEvent';

export interface IGasEventRepository {
  listEvents(): Promise<GasEvent[]>;
}

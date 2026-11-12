import { IGasEventRepository } from '../domain/IGasEventRepository';
import { GasEvent } from '../domain/GasEvent';

export function listEvents(repository: IGasEventRepository): Promise<GasEvent[]> {
  return repository.listEvents();
}

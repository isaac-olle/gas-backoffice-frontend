import { IGasEventRepository } from '../../domain/IGasEventRepository';
import { GasEvent } from '../../domain/GasEvent';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

interface GasEventDto {
  event_id: string;
  event_type: string;
  aggregate_id: string;
  aggregate_type: string;
  author_id: string | null;
  author_role: string | null;
  payload: unknown;
  occurred_at: string;
}

export class GasEventRepository implements IGasEventRepository {
  async listEvents(): Promise<GasEvent[]> {
    const dtos = await httpClient.get<GasEventDto[]>('/v1/backoffice/events');
    return dtos.map((dto) => ({
      id: dto.event_id,
      type: dto.event_type,
      aggregateId: dto.aggregate_id,
      aggregateType: dto.aggregate_type,
      authorId: dto.author_id ?? null,
      authorRole: dto.author_role ?? null,
      payload: dto.payload,
      occurredAt: dto.occurred_at,
    }));
  }
}

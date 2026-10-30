import { IGasErrorRepository } from '../../domain/IGasErrorRepository';
import { GasError, GasErrorStackTrace } from '../../domain/GasError';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

// DTO d'error tal com el retorna el backend (snake_case).
interface GasErrorDto {
  error_id: string;
  type: string;
  code: string;
  description: string;
  details?: unknown;
  cause?: string[] | null;
  stack_trace?: GasErrorStackTrace | null;
  request_id: string;
  occurred_at: string;
}

function toGasError(dto: GasErrorDto): GasError {
  return {
    id: dto.error_id,
    type: dto.type,
    code: dto.code,
    description: dto.description,
    details: dto.details ?? null,
    cause: dto.cause ?? [],
    stackTrace: dto.stack_trace ?? null,
    requestId: dto.request_id,
    occurredAt: dto.occurred_at,
  };
}

export class GasErrorRepository implements IGasErrorRepository {
  async listErrors(): Promise<GasError[]> {
    const dtos = await httpClient.get<GasErrorDto[]>('/v1/backoffice/errors');
    return dtos.map(toGasError);
  }
}

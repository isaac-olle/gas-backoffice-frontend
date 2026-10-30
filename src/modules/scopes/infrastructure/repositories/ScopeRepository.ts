import { IScopeRepository } from '../../domain/IScopeRepository';
import { Scope } from '../../domain/Scope';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

// DTO d'scope tal com el retorna el backend (snake_case).
interface ScopeDto {
  id: string;
  name: string;
  protected_resource_id: string;
  author_id: string;
  author_role: string;
  allowed_client_ids: string[];
  is_system: boolean;
  enabled: boolean;
  version: number;
}

function toScope(dto: ScopeDto): Scope {
  return {
    id: dto.id,
    name: dto.name,
    protectedResourceId: dto.protected_resource_id,
    authorId: dto.author_id,
    authorRole: dto.author_role,
    allowedClientIds: dto.allowed_client_ids,
    isSystem: dto.is_system,
    enabled: dto.enabled,
    version: dto.version,
  };
}

export class ScopeRepository implements IScopeRepository {
  async getScope(scopeId: string): Promise<Scope> {
    const dto = await httpClient.get<ScopeDto>(`/v1/backoffice/scopes/${scopeId}`);
    return toScope(dto);
  }
}

import {
  CreateProtectedResourceInput,
  IProtectedResourceRepository,
} from '../../domain/IProtectedResourceRepository';
import { ProtectedResource } from '../../domain/ProtectedResource';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

// DTO de protected resource tal com el retorna el backend (snake_case).
interface ProtectedResourceDto {
  id: string;
  name: string;
  author_id: string;
  author_role: string;
  is_system: boolean;
  enabled: boolean;
  scope_ids?: string[] | null;
  version: number;
}

function toProtectedResource(dto: ProtectedResourceDto): ProtectedResource {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.enabled ? 'active' : 'inactive',
    authorId: dto.author_id,
    authorRole: dto.author_role,
    isSystem: dto.is_system,
    scopes: dto.scope_ids ?? [],
    version: dto.version,
  };
}

export class ProtectedResourceRepository implements IProtectedResourceRepository {
  async listProtectedResources(): Promise<ProtectedResource[]> {
    const dtos = await httpClient.get<ProtectedResourceDto[]>(
      '/v1/backoffice/protected-resources',
    );
    return dtos.map(toProtectedResource);
  }

  async createProtectedResource(input: CreateProtectedResourceInput): Promise<void> {
    await httpClient.put<void>(
      `/v1/backoffice/subscriptions/${input.subscriptionId}/protected-resources/${input.id}`,
      { name: input.name },
    );
  }
}

import { CreateClientInput, IClientRepository } from '../../domain/IClientRepository';
import { Client } from '../../domain/Client';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

// DTO de client tal com el retorna el backend (snake_case).
interface ClientDto {
  id: string;
  name: string;
  subscription_id: string;
  author_id: string;
  author_role: string;
  enabled: boolean;
  public: boolean;
  is_system: boolean;
  allowed_grant_types: string[];
  redirect_uris: string[];
  secret_ids: string[];
  allowed_scopes?: string[] | null;
  version: number;
}

function toClient(dto: ClientDto): Client {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.enabled ? 'active' : 'inactive',
    subscriptionId: dto.subscription_id,
    authorId: dto.author_id,
    authorRole: dto.author_role,
    public: dto.public,
    isSystem: dto.is_system,
    allowedGrantTypes: dto.allowed_grant_types,
    redirectUris: dto.redirect_uris,
    secretIds: dto.secret_ids,
    allowedScopes: dto.allowed_scopes ?? [],
    version: dto.version,
  };
}

export class ClientRepository implements IClientRepository {
  async listClients(): Promise<Client[]> {
    const dtos = await httpClient.get<ClientDto[]>('/v1/backoffice/clients');
    console.log('[ClientRepository] response:', dtos);
    return dtos.map(toClient);
  }

  async createClient(input: CreateClientInput): Promise<void> {
    await httpClient.put<void>(
      `/v1/backoffice/subscriptions/${input.subscriptionId}/clients/${input.id}`,
      {
        name: input.name,
        allowed_grant_types: input.allowedGrantTypes,
        redirect_uris: input.redirectUris,
        public: input.public,
        authentication: {
          ...(input.authentication.clientSecret
            ? { client_secret: input.authentication.clientSecret }
            : {}),
          ...(input.authentication.clientAssertionKey
            ? { client_assertion_key: input.authentication.clientAssertionKey }
            : {}),
        },
        allowed_scopes: input.allowedScopes.map((scopeId) => ({ scope_id: scopeId })),
      },
    );
  }
}

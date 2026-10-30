import {
  CreateManagedUserInput,
  IManagedUserRepository,
} from '../../domain/IManagedUserRepository';
import { ManagedUser, ManagedUserRole } from '../../domain/ManagedUser';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

// DTO d'usuari gestionat tal com el retorna el backend (snake_case).
interface ManagedUserDto {
  id: string;
  name: string;
  email: string;
  system_role?: ManagedUserRole;
  role?: ManagedUserRole;
  author_id: string;
  author_role: string;
  is_system: boolean;
  version: number;
  subscription_ids?: string[] | null;
}

function toManagedUser(dto: ManagedUserDto): ManagedUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.system_role ?? dto.role ?? 'subscription_user',
    authorId: dto.author_id,
    authorRole: dto.author_role,
    isSystem: dto.is_system,
    version: dto.version,
    subscriptionIds: dto.subscription_ids ?? [],
  };
}

export class ManagedUserRepository implements IManagedUserRepository {
  async listManagedUsers(): Promise<ManagedUser[]> {
    const dtos = await httpClient.get<ManagedUserDto[]>('/v1/backoffice/users');
    return dtos.map(toManagedUser);
  }

  async getManagedUser(userId: string): Promise<ManagedUser> {
    const dto = await httpClient.get<ManagedUserDto>(`/v1/backoffice/users/${userId}`);
    return toManagedUser(dto);
  }

  async createManagedUser(input: CreateManagedUserInput): Promise<void> {
    await httpClient.put<void>(`/v1/backoffice/users/${input.id}`, {
      name: input.name,
      email: input.email,
      role: input.role,
      is_system: input.isSystem,
      subscription_ids: input.subscriptionIds,
    });
  }

  async deleteManagedUser(userId: string): Promise<void> {
    await httpClient.delete(`/v1/backoffice/users/${userId}`);
  }

  async addSubscriptionPermission(userId: string, subscriptionId: string): Promise<void> {
    await httpClient.post<void>(
      `/v1/backoffice/subscriptions/${subscriptionId}/members/${userId}`,
    );
  }
}

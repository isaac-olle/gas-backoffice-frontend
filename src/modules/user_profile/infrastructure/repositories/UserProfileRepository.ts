import { IUserProfileRepository } from '../../domain/IUserProfileRepository';
import { UserProfile } from '../../domain/UserProfile';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

// DTO de perfil tal com el retorna el backend (snake_case).
interface UserProfileDto {
  id: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  picture?: string | null;
}

function toUserProfile(dto: UserProfileDto): UserProfile {
  return {
    id: dto.id,
    displayName: dto.display_name ?? dto.email,
    email: dto.email,
    avatarUrl: dto.avatar_url ?? dto.picture ?? undefined,
  };
}

export class UserProfileRepository implements IUserProfileRepository {
  async getCurrentUserProfile(): Promise<UserProfile> {
    const dto = await httpClient.get<UserProfileDto>('/v1/backoffice/users/me');
    return toUserProfile(dto);
  }
}

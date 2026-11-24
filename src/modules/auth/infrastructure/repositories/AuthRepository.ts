import { InitLoginParams, ExchangeCodeParams, IAuthRepository } from '../../domain/IAuthRepository';
import { User, UserRole } from '../../domain/User';
import { httpClient, apiBaseUrl, clearCsrfToken, onSessionExpired } from '../../../../shared/infrastructure/http/httpClient';

// DTO d'usuari tal com el retorna el backend (snake_case).
interface UserDto {
  id: string;
  email: string;
  system_role?: UserRole;
  role?: UserRole;
  author_id?: string | null;
  author_role?: string | null;
}

function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.system_role ?? dto.role ?? 'subscription_user',
    authorId: dto.author_id ?? undefined,
    authorRole: dto.author_role ?? undefined,
  };
}

export class AuthRepository implements IAuthRepository {
  initLogin(params: InitLoginParams): void {
    clearCsrfToken();
    const query = new URLSearchParams({
      idp_reference_name: params.idpReferenceName,
      scope: 'profile',
    });
    window.location.href = `${apiBaseUrl}/v1/backoffice/auth/login?${query.toString()}`;
  }

  async exchangeCode(params: ExchangeCodeParams): Promise<void> {
    // El backend bescanvia el codi i guarda la sessió en una cookie HttpOnly;
    // El token CSRF opcional es conserva només en memòria.
    clearCsrfToken();
    await httpClient.post('/v1/backoffice/auth/callback', {
      idp_reference_name: params.idpReferenceName,
      code: params.code,
      state: params.state,
    });
  }

  async signOut(): Promise<void> {
    await httpClient.post('/v1/backoffice/auth/logout');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const dto = await httpClient.get<UserDto>('/v1/backoffice/users/me');
      return toUser(dto);
    } catch {
      // Sense sessió (401) o error: no hi ha usuari autenticat.
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onSessionExpired(() => callback(null));
  }
}

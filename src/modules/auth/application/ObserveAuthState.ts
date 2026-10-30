import { IAuthRepository } from '../domain/IAuthRepository';
import { User } from '../domain/User';

export function observeAuthState(
  authRepository: IAuthRepository,
  onChange: (user: User | null) => void
): () => void {
  return authRepository.onAuthStateChange(onChange);
}

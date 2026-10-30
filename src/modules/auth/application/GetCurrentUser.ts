import { IAuthRepository } from '../domain/IAuthRepository';
import { User } from '../domain/User';

export function getCurrentUser(authRepository: IAuthRepository): Promise<User | null> {
  return authRepository.getCurrentUser();
}

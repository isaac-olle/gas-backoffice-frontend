import { IAuthRepository } from '../domain/IAuthRepository';

export function signOut(authRepository: IAuthRepository): Promise<void> {
  return authRepository.signOut();
}

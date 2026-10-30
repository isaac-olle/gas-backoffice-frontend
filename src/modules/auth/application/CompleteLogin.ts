import { IAuthRepository } from '../domain/IAuthRepository';
import { User } from '../domain/User';

export interface CompleteLoginInput {
  idpReferenceName: string;
  code: string;
  state: string;
}

export interface CompleteLoginResult {
  user: User | null;
}

export async function completeLogin(
  authRepository: IAuthRepository,
  input: CompleteLoginInput,
): Promise<CompleteLoginResult> {
  await authRepository.exchangeCode({
    idpReferenceName: input.idpReferenceName,
    code: input.code,
    state: input.state,
  });

  // La sessió ja viu en una cookie HttpOnly; llegim l'usuari (i el rol) de /users/me.
  const user = await authRepository.getCurrentUser();

  return { user };
}

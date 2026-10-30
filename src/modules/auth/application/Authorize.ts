import { IAuthRepository } from '../domain/IAuthRepository';

export interface AuthorizeInput {
  idpReferenceName: string;
}

export function authorize(
  authRepository: IAuthRepository,
  input: AuthorizeInput,
): void {
  authRepository.initLogin({ idpReferenceName: input.idpReferenceName });
}

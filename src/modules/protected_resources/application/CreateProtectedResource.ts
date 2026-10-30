import {
  CreateProtectedResourceInput,
  IProtectedResourceRepository,
} from '../domain/IProtectedResourceRepository';

export function createProtectedResource(
  repository: IProtectedResourceRepository,
  input: CreateProtectedResourceInput,
): Promise<void> {
  return repository.createProtectedResource(input);
}

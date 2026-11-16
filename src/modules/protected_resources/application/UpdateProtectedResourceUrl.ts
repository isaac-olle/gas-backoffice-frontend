import {
  IProtectedResourceRepository,
  UpdateProtectedResourceUrlInput,
} from '../domain/IProtectedResourceRepository';

export function updateProtectedResourceUrl(
  repository: IProtectedResourceRepository,
  input: UpdateProtectedResourceUrlInput,
): Promise<void> {
  return repository.updateProtectedResourceUrl(input);
}

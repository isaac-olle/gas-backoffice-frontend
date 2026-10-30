import { IProtectedResourceRepository } from '../domain/IProtectedResourceRepository';
import { ProtectedResource } from '../domain/ProtectedResource';

export function listProtectedResources(
  protectedResourceRepository: IProtectedResourceRepository,
): Promise<ProtectedResource[]> {
  return protectedResourceRepository.listProtectedResources();
}

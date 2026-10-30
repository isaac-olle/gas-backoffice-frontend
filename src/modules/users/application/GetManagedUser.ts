import { IManagedUserRepository } from '../domain/IManagedUserRepository';
import { ManagedUser } from '../domain/ManagedUser';

export function getManagedUser(
  managedUserRepository: IManagedUserRepository,
  userId: string,
): Promise<ManagedUser> {
  return managedUserRepository.getManagedUser(userId);
}

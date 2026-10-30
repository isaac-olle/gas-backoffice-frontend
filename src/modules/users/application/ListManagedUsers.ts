import { IManagedUserRepository } from '../domain/IManagedUserRepository';
import { ManagedUser } from '../domain/ManagedUser';

export function listManagedUsers(
  managedUserRepository: IManagedUserRepository,
): Promise<ManagedUser[]> {
  return managedUserRepository.listManagedUsers();
}

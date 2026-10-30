import { IManagedUserRepository } from '../domain/IManagedUserRepository';

export function deleteManagedUser(
  managedUserRepository: IManagedUserRepository,
  userId: string,
): Promise<void> {
  return managedUserRepository.deleteManagedUser(userId);
}
